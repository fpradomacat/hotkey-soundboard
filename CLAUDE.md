# CLAUDE.md

Guidance for Claude (and any other AI assistant) working in this repository.
Read this first. If something here contradicts the code, the code wins: tell the user and update this file.

## What this app is

**Hotkey Soundboard**: a browser soundboard ("botonera") of short Spanish-language (Argentine) audio clips: catchphrases, inside jokes and football commentary. Each clip is a card with a PLAY button and a keyboard hotkey. There is a global STOP button (also Shift), a search box, and clips are grouped into sections (one per keyboard row).

- UI language: Spanish (Rioplatense). Code, comments, docs and commit messages: **English**.
- Single-page Angular app, no backend, no database, no auth. All data is static and shipped with the bundle.
- Live site: https://fpradomacat.github.io/hotkey-soundboard/ (GitHub Pages). Remote: `github.com/fpradomacat/hotkey-soundboard` (renamed from `sound-effects-library`). The local folder is still `D:\GIT\sound-effects-library`.
- Branches: `master` (deployed), `dev`, `esolutions`.

## Stack

- Angular 22: standalone components, signals (`signal`, `computed`, `input()`), zoneless change detection, `@if` / `@for` control flow, `inject()`. TypeScript 6 strict, RxJS 7 (barely used), SCSS.
- Builder: `@angular/build:application` (esbuild). Tests: Karma + Jasmine in Chrome (`@angular/build:karma`). Lint: ESLint with `angular-eslint`, including template accessibility rules.
- Node: **22.22.3 or newer** (or 24.15+). Angular 22 refuses to run on older Node and on odd versions such as 25. CI uses Node 22.
- No UI library and no zone.js. Pixel look done by hand with the self-hosted font Press Start 2P (SIL OFL, in `src/fonts/`).

## Commands

```bash
npm ci                    # install from the lockfile
npm start                 # ng serve -> http://localhost:4200
npm run build             # production build into dist/sound-effects-library/browser
npm test                  # Karma, watch mode, opens Chrome
npm run test:ci           # Karma once, headless (ChromeHeadlessCI launcher, no sandbox)
npm run lint              # ESLint, includes template accessibility rules
npm run validate:sounds   # checks every pack in src/assets/packs (pack.json vs mp3 files, hotkeys)
```

Before saying a change is done, run `npm run validate:sounds && npm run lint && npm run test:ci && npm run build`. CI runs exactly that on every pull request.

## Architecture

```
src/main.ts                       bootstrapApplication(AppComponent, appConfig)
src/app/
  app.config.ts / app.routes.ts   zoneless + router with input binding. Route `p/:packId` (resolver loads the pack); anything else redirects to `p/classic`
  packs/
    pack.ts                       PackFile types + buildPack(id, json, baseUrl)
    pack.service.ts               fetches index.json / pack.json at runtime, caches packs; DEFAULT_PACK_ID
    pack.resolver.ts              route resolver; unknown pack -> redirect to the default
  pack-selector/              links to every pack (hidden when there is only one)
  classes/
    Sound.ts      file id, display name, hotkey; asset path; isSameHotkey(); aria shortcut text
    Section.ts    name, description, sounds (getters)
    Hotkey.ts     { key: string; isCtrlPressed: boolean }
  sounds-library.service.ts   holds the open pack (setPack); hotkey lookup + accent-insensitive search
  sound-player.ts             abstract SoundPlayer
  sound-player.service.ts     ONE shared HTMLAudioElement; exposes currentSound as a signal
  dashboard/                  page: <h1>, search box, global keydown handler, live region, sections
  sounds-section/             a Section as a grid of cards (input.required)
  sound-card/                 one clip: <button>, name, hotkey badge, "playing" highlight
  stop-button/                fixed button on the left edge; looks pressed while Shift is held
src/styles/_mixins.scss       clickable-box mixin (pixel border), used with @use 'mixins'
src/assets/packs/            index.json (pack ids) + <id>/pack.json + <id>/*.mp3 (THE DATA)
src/fonts/                    Press Start 2P (woff2) + its license
scripts/validate-sounds.mjs   data check (missing mp3, unused mp3, repeated hotkey, bad fields)
```

### Data flow

1. The route resolver loads `assets/packs/<id>/pack.json` with `PackService` and `buildPack()`; the dashboard gets it as the `pack` input and calls `SoundsLibraryService.setPack()` (also stops the sound and clears the search).
2. `DashboardComponent` listens to `window:keydown` (via `host`). It ignores keys while the search box has text or focus. **Shift = stop**. Otherwise it ignores key repeat and Alt/Meta, lower-cases `event.key` (Caps Lock), and calls `playSoundByHotkey`; `preventDefault()` only if a clip was played.
3. `SoundPlayerService.playSound()` sets `audio.src`, calls `load()` then `play()`. Playing a clip always cuts the previous one (intended). `currentSound` is cleared on `ended`, `pause` and `error`.
4. `SoundCardComponent` highlights itself when `currentSound()` is its sound. The dashboard announces "Reproduciendo X" in an `aria-live` region.
5. Search: `searchResults` is a `computed` over `searchText`, so it is rebuilt once per input change.

### Adding a clip

1. Put `my_clip.mp3` in `src/assets/packs/<id>/` (snake_case or kebab-case, no spaces; clips are small, 10-50 KB).
2. Add `{ "file": "my_clip", "name": "Display name", "hotkey": "x" }` to a section in that pack's `pack.json`. `"ctrl": true` makes Ctrl required; omit `hotkey` for no hotkey.
3. `npm run validate:sounds` must pass. Hotkeys are unique per (key, ctrl) pair, per pack.

### Adding a pack

New folder in `src/assets/packs/` with `pack.json` + mp3s, and its id in `index.json`. No code change. Pack ids: lower case letters, digits, `-` (PackService rejects anything else). Not done yet, but the format allows it: loading a pack from a URL (`?pack=`) or importing a local folder (IndexedDB) for private packs.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `master` and publishes with the official Pages actions (repo Settings -> Pages -> Source = "GitHub Actions"). The `--base-href` comes from the repository name, so renaming the repo needs no change. The application builder writes the site to `dist/site/browser`; the workflow copies `index.html` to `404.html` (SPA fallback) there.
`.github/workflows/ci.yml` runs validate + lint + tests + build on pull requests.

Audio URLs are relative (`assets/packs/<id>/x.mp3`) and resolve against `<base href>`, so the app works at `/` in dev and at `/<repo>/` on Pages.

## Conventions

- English everywhere in the repo. Only user-facing UI text and clip names are Spanish.
- Follow `.editorconfig` (2 spaces, single quotes in TS). Keep `strict` TypeScript and `strictTemplates`; do not loosen them to silence errors.
- New code uses the modern style already in the repo: standalone components, `inject()`, signals, `input()`, `@if` / `@for`, `host` metadata instead of `@HostListener`, `OnPush`.
- Component per folder (`name/name.component.{ts,html,scss,spec.ts}`). Tests live next to the code and test behavior (events, DOM, accessibility), not just "it creates".
- Styles: `@use 'mixins'` (never `@import`). Component style budget is 2 KB warning / 4 KB error; initial bundle 500 KB / 1 MB.
- Keep accessibility: real `<button>`s, `aria-label`s, visible `:focus-visible`, `aria-keyshortcuts`. `npm run lint` enforces part of it.
- Commits: short imperative subject, details in extra `-m` paragraphs. One concern per commit.
- `.gitattributes` normalizes line endings (`text=auto`); do not convert files by hand.
- Do not edit `dist/`. Do not commit `node_modules`.

## Known limitations

- `Ctrl+1` cannot be intercepted: browsers reserve it for tab switching, and Chrome ignores `preventDefault()` for it.
- Shift always means "stop", so shifted keys can never be hotkeys.
- Hotkeys are useless on touch devices; the cards are still tappable.
- White text on the light-blue search box and header color (#00a3cc) is below WCAG AA contrast (about 2.9:1). Not changed because it alters the look.
- Audio rights: several clips are recordings of identifiable people and broadcast commentary. The MIT license covers the code only.

## Ideas not done yet

- Volume slider and loop toggle (`va-el-tercero_loop` is named "loop" but nothing repeats it).
- Playing several clips at once and instant start, with the Web Audio API (replaces the shared `Audio` element).
- Installable offline PWA (the clips total about 1 MB).
- Karma -> Vitest (`ng update @angular/cli --name migrate-karma-to-vitest`).

## Working agreement for AI assistants

- Before changing behavior, say what you will change and why; after, say how you verified it. If you could not run the app or the tests, say so instead of claiming it works.
- Never invent audio files or clip names. Ask the user for new clips.
- Ask before: upgrading Angular/Node major versions, renaming the repo, changing hotkeys users may have memorized, changing the license.
- Files under `.github/workflows/` may be protected for automated tools: hand them to the user to place.
