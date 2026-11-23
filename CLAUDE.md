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

- Angular 13.3 (NgModule-based, no standalone components), TypeScript 4.6 strict, RxJS 7.5, SCSS.
- Tests: Karma + Jasmine (`*.spec.ts` files are mostly the CLI-generated stubs; there is no meaningful coverage yet).
- Node: use **16.x** (Angular 13 officially supports 12.20 / 14.15 / 16.10). Newer Node may print engine warnings or fail.
- No UI library. Retro/pixel look done by hand (font "Press Start 2P" from Google Fonts, `.clickable-box` mixin in `src/styles.scss`).

## Commands

```bash
npm ci                 # install (use the lockfile)
npm start              # ng serve -> http://localhost:4200
npm run build          # production build into dist/sound-effects-library
npm test               # Karma (needs Chrome)
npm run deploy         # LEGACY manual deploy: builds into docs/ with base-href /sound-effects-library/
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

## Known issues (found by reading the code; NOT yet reproduced or fixed)

Treat as the starting backlog for the bug-fixing phase. Verify each one before fixing.

1. **Missing audio file:** `sounds-database.ts` references `sabersubirybajar` ("Subí y bajá", hotkey `u`) but there is no `sabersubirybajar.mp3` in `src/assets/audio/`. The card exists and plays nothing (404).
2. **Orphan files:** `adam_eee`, `adam_em`, `agu_ay_agustin1`, `votamos1`, `yvo_casocerrado2` exist as mp3 but no `Sound` uses them.
3. **Hard-coded production URL** in `SoundPlayerService.playSound()`: `https://fpradomacat.github.io/sound-effects-library/assets/audio/...`. Breaks on rename, fork, custom domain or preview deploys. Should be a relative path resolved against `<base href>`.
4. **Fragile dev path:** `Sound.source` returns `../../assets/audio/<id>.mp3`, which only works because the app lives at `/dashboard`.
5. **Hotkey edge cases** in `DashboardComponent.handleKeyPressed`:
   - Caps Lock on => `event.key` is uppercase and nothing matches.
   - No `event.repeat` check: holding a key restarts the clip over and over.
   - Alt/Meta combinations are not excluded.
   - Ctrl hotkeys (`Ctrl+A`, `Ctrl+1`) collide with browser shortcuts (select all, switch tab) and `preventDefault()` is never called.
   - Shift is always "stop", so uppercase/shifted keys can never be hotkeys.
6. **Unhandled promise** from `audio.play()` (rejects if interrupted by `load()` or blocked by autoplay policy).
7. **Probable change-detection problem:** the template calls `soundsLibraryService.searchSoundsByText(searchText)` inside a binding, which returns a new `Section` on every change-detection pass (likely `ExpressionChangedAfterItHasBeenChecked` in dev mode, and cards re-created on every cycle). Verify in the browser console.
8. **Misleading section description:** the first section says `Fila letra "W"` but its keys start at `q` (it is the Q row).
9. **Accessibility:** the PLAY control is a `div` with `(click)`, not a `<button>`; no focus/keyboard/aria support. Hotkeys are useless on touch devices.
10. **Dead code / leftovers:** unused `HeaderComponent`, unused `col-*` grid CSS in `styles.scss`, `//todo rename to SoundsSection` in `Section.ts`, README is still the Angular CLI boilerplate.
11. **Audio rights:** several clips are recordings of identifiable people and broadcast commentary. Worth a conscious decision before promoting the repo publicly.

## Conventions

- English everywhere in the repo (code, comments, docs, commits). Only user-facing UI text and clip names are Spanish.
- Follow `.editorconfig` (2 spaces). Keep `strict` TypeScript and `strictTemplates`; do not loosen them to silence errors.
- Component per folder (`name/name.component.{ts,html,scss,spec.ts}`), generated with `ng generate component`.
- Commits: short imperative subject ("Fix missing audio for subir y bajar"). One concern per commit.
- Do not hand-edit `docs/` or `dist/`. Do not commit `node_modules`.
- Component style budget is 2 KB warning / 4 KB error and the initial bundle is 500 KB / 1 MB (`angular.json`). Respect it.

## Working agreement for AI assistants

- The project is improved in phases: (1) document, (2) fix existing bugs, (3) analyze improvements, (4) implement the selected ones. Do not jump ahead: no feature work during bug-fixing, no refactors "while we are here".
- Before changing behavior, say what you will change and why; after, say how you verified it. If you could not run the app or the tests, say so instead of claiming it works.
- Never invent audio files or clip names. Ask the user for new clips.
- Ask before: upgrading Angular/Node major versions, renaming the repo, deleting `docs/`, changing hotkeys users may have memorized.
