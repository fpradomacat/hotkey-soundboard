# CLAUDE.md

Guidance for Claude (and any other AI assistant) working in this repository.
Read this first. If something here contradicts the code, the code wins: tell the user and update this file.

## What this app is

A browser soundboard ("botonera") of short Spanish-language (Argentine) audio clips: catchphrases, inside jokes and football commentary. Each clip is a card with a PLAY button and a keyboard hotkey. There is a global STOP button, a search box, and clips are grouped into sections (one section per keyboard row).

- UI language: Spanish (Rioplatense). Code, comments, docs and commit messages: **English**.
- Single-page Angular app, no backend, no database, no auth. All data is static and shipped with the bundle.
- Live site: https://fpradomacat.github.io/sound-effects-library/ (GitHub Pages).
- Remote: `github.com/fpradomacat/sound-effects-library`. Branches: `master` (deployed), `dev`, `esolutions`.

## Stack

- Angular 22 (upgraded from 13 in phase 2), NgModule-based: components are declared in `AppModule` with `standalone: false`. TypeScript 6 strict, RxJS 7, SCSS. Builder is still `@angular-devkit/build-angular:browser` (webpack).
- Tests: Karma + Jasmine (`*.spec.ts` files are mostly the CLI-generated stubs; there is no meaningful coverage yet).
- Node: **22.22.3 or newer** (or 24.15+). Angular 22 refuses to run on older Node. CI uses Node 22.
- No UI library. Retro/pixel look done by hand (font "Press Start 2P" from Google Fonts, `.clickable-box` mixin in `src/styles.scss`).

## Commands

```bash
npm ci                 # install (use the lockfile)
npm start              # ng serve -> http://localhost:4200
npm run build          # production build into dist/sound-effects-library
npm test               # Karma (needs Chrome). Headless: run with a karma config using ChromeHeadless --no-sandbox
npm run deploy         # LEGACY (still works, but Pages is deployed by GitHub Actions) manual deploy: builds into docs/ with base-href /sound-effects-library/
```

## Architecture

```
src/app/
  app.module.ts / app-routing.module.ts   '' -> redirect to /dashboard; only route is /dashboard
  sounds-database.ts                      THE DATA: hard-coded Section[] with Sound[]
  classes/
    Sound.ts      file id, display name, hotkey; builds the asset path; isSameHotkey()
    Section.ts    name, description, sounds (getters, no public fields)
    Hotkey.ts     { key: string; isCtrlPressed: boolean }
  sounds-library.service.ts   read access to sections; hotkey lookup; accent-insensitive text search
  sound-player.ts             abstract SoundPlayer (playSound / playSoundByHotkey / stopCurrentSound)
  sound-player.service.ts     implementation: ONE shared HTMLAudioElement
  dashboard/                  page: search input + window keydown handler + sections
  sounds-section/             renders a Section as a grid of cards
  sound-card/                 one clip: PLAY button, name, hotkey badge
  stop-button/                fixed button on the left edge; lights up while Shift is held
  header/                     info banner ("press SHIFT to stop"); NOT currently used (commented out in dashboard.component.html)
src/assets/audio/*.mp3        the clips (source of truth)
docs/                         BUILD OUTPUT served by GitHub Pages (see Deployment). Never edit by hand.
```

### Data flow

1. `sounds-database.ts` exports `soundSections`. `SoundsLibraryService` exposes it (lazy getter) and flattens it for lookups.
2. `DashboardComponent` listens to `window:keydown`. It ignores keys while the search input is focused or has text. **Shift = stop**; any other key becomes `{ key: event.key, isCtrlPressed: event.ctrlKey }` and is looked up with `getSoundByHotkey`.
3. `SoundPlayerService.playSound()` sets `audio.src`, calls `load()` then `play()`. There is a single `Audio` element, so playing a clip always cuts the previous one (intended behavior).
4. Search: `searchSoundsByText` builds a new `Section('Resultados')` with the sounds whose display name contains the text (case- and accent-insensitive).

### Adding a clip (current process)

1. Put `my_clip.mp3` in `src/assets/audio/` (snake_case or kebab-case, no spaces; keep clips short and small, most are 10-50 KB).
2. Add `new Sound('my_clip', 'Display name', 'x')` to the right `Section` in `sounds-database.ts`. The first arg is the file name WITHOUT `.mp3`. Third arg is the hotkey (single `event.key` value); fourth arg `true` means Ctrl is required.
3. Hotkeys must be unique per (key, ctrl) pair. Use `''` for "no hotkey".

## Deployment

**Current (legacy, manual):** `npm run deploy` builds into `docs/`, then someone copies `docs/index.html` to `docs/404.html` (SPA fallback), commits and pushes. GitHub Pages serves the `docs/` folder of `master`. The build output (and a second copy of every mp3) is committed to git.

**Target:** GitHub Actions workflow `.github/workflows/deploy.yml` builds on every push to `master` and publishes with the official Pages actions. Requires repo Settings -> Pages -> Source = "GitHub Actions". Once it works, delete `docs/` and add it to `.gitignore`. The workflow derives `--base-href` from the repository name, so renaming the repo does not break the build.

## Known issues

Phase 2 (bug fixing) status. "Fixed" items were verified with a production build and unit tests, not by manual testing in a browser.

**Fixed in phase 2**
- Production audio URL was hard-coded to `fpradomacat.github.io/...`; `Sound.source` is now the relative path `assets/audio/<id>.mp3`, resolved against `<base href>`.
- Hotkeys: Caps Lock no longer breaks them (keys are lower-cased), key auto-repeat is ignored, Alt/Meta combos are ignored, and `preventDefault()` is called only when a clip was actually played (so `Ctrl+A` no longer also selects the page text).
- `audio.play()` rejections are handled (`AbortError` ignored, others logged).
- Search results were rebuilt on every change-detection pass; they are now built once per input change (`DashboardComponent.onSearchTextChange`).
- First section description said row "W"; it is the Q row.

**Open, waiting for a decision from the user**
1. `sabersubirybajar` ("Subí y bajá", hotkey `u`) is in `sounds-database.ts` but `src/assets/audio/sabersubirybajar.mp3` does not exist. The card plays nothing. Needs the real file, or the entry removed.
2. Orphan mp3 files nobody references: `adam_eee`, `adam_em`, `agu_ay_agustin1`, `votamos1`, `yvo_casocerrado2`. Add them as sounds or delete them.

**Known limitations (not bugs to fix now)**
- `Ctrl+1` cannot be intercepted: browsers reserve it for tab switching, and Chrome ignores `preventDefault()` for it.
- Shift always means "stop", so shifted keys can never be hotkeys.
- Angular's `ng update` migrations changed a few files in phase 2: `ChangeDetectionStrategy.Eager` was added explicitly to components (Angular 22 changed the default), templates now use `@if` / `@for` block syntax instead of `*ngIf` / `*ngFor`. Use the new syntax in new code.
- Build warnings that remain: component style budget (`dashboard.component.scss` ~2.13 kB and `header.component.scss` ~2.06 kB vs 2 kB) and Sass deprecation warnings for `@import "src/styles"` in three component SCSS files (move to `@use` in phase 4).

**Done in phase 2: Angular 13 -> 22**, one major at a time. Verified with a production build, the unit tests and a headless-Chrome smoke test that the page renders all 28 cards under a `/<repo>/` base href. Not tested by hand in a real browser.

**Backlog for phase 3 (improvements)**
- PLAY control is a `div` with `(click)`, not a `<button>`; no keyboard focus or aria. Hotkeys are useless on touch devices.
- Dead code: unused `HeaderComponent`, unused `col-*` grid CSS in `styles.scss`, `//todo rename to SoundsSection` in `Section.ts`, README is still the Angular CLI boilerplate.
- Optional Angular migrations not applied yet: new application builder (esbuild, `ng update @angular/cli --name use-application-builder`) and Karma -> Vitest (`--name migrate-karma-to-vitest`).
- Audio rights: several clips are recordings of identifiable people and broadcast commentary. Worth a conscious decision before promoting the repo publicly.

## Conventions

- English everywhere in the repo (code, comments, docs, commits). Only user-facing UI text and clip names are Spanish.
- Follow `.editorconfig` (2 spaces). Keep `strict` TypeScript and `strictTemplates`; do not loosen them to silence errors.
- Component per folder (`name/name.component.{ts,html,scss,spec.ts}`), generated with `ng generate component`.
- Commits: short imperative subject ("Fix missing audio for subir y bajar"). One concern per commit.
- Source files use Windows line endings (CRLF). Keep them: do not convert whole files to LF, or git diffs become unreadable.
- Do not hand-edit `docs/` or `dist/`. Do not commit `node_modules`.
- Component style budget is 2 KB warning / 4 KB error and the initial bundle is 500 KB / 1 MB (`angular.json`). Respect it.

## Working agreement for AI assistants

- The project is improved in phases: (1) document, (2) fix existing bugs, (3) analyze improvements, (4) implement the selected ones. Do not jump ahead: no feature work during bug-fixing, no refactors "while we are here".
- Before changing behavior, say what you will change and why; after, say how you verified it. If you could not run the app or the tests, say so instead of claiming it works.
- Never invent audio files or clip names. Ask the user for new clips.
- Ask before: upgrading Angular/Node major versions, renaming the repo, deleting `docs/`, changing hotkeys users may have memorized.
