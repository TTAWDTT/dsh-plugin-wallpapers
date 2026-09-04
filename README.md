# dsh-plugin-wallpapers

English | [中文](README.zh.md)

Use any installed **Wallpaper Engine** wallpaper as the background of the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI. Zero-config Steam detection, range-enabled video streaming, and a picker dialog in Settings → General. **dsh's own background is what changes — the Windows desktop wallpaper is never touched.**

https://github.com/user-attachments/assets/00000000-0000-0000-0000-000000000000

## Features

- **One-click pick** — Settings → General → **Wallpaper** → Choose: every Workshop and bundled wallpaper appears with its live preview thumbnail, title, and kind. The current pick is marked; clicking it again clears it.
- **Zero configuration** — the Steam root is detected from the Windows registry (`HKCU\Software\Valve\Steam\SteamPath`), then standard install locations; the Wallpaper Engine install (app `431960`) is found through `libraryfolders.vdf` on its own. A first-ever install is picked up without a restart. `D:\Steam`-style custom roots are one config entry away (see [Config](#config)).
- **Video and web wallpapers** — `video` wallpapers stream as an HTML `<video>` with HTTP range support (seekable, cheap on memory); `web` wallpapers load as an iframe. Scene wallpapers are listed but greyed out (the `scene.pkg` format is proprietary).
- **Audio follow the picker** — video background audio is muted by default; the dialog's checkbox unmutes it. The preference is durable.
- **Search and filter** — the dialog narrows by title or id, with All / Video / Web type toggles.
- **Both color schemes** — while a wallpaper plays, the app's surfaces turn into translucent glass sheets tinted from the active scheme (light: white veils, dark: dark veils); the sidebar, composer, message bubbles, settings panel, and menus stay readable over any frame. Clearing the selection restores the base palette exactly.
- **Degrades gracefully** — without Wallpaper Engine (or without the host plugin), the row still renders and the dialog explains the absence; a headless composition loads the plugin without any error.

## Install

With the `dsh` CLI available, install from npm (prebuilt artifacts, no build permission needed):

```sh
dsh plugin --profile web add dsh-plugin-wallpapers
```

Or install the sources from GitHub:

```sh
dsh plugin --profile web add github:TTAWDTT/dsh-plugin-wallpapers
```

pnpm will ask you to allow this package's build script on first install (git installs fetch sources, not built artifacts); add the printed key to the profile's `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  dsh-plugin-wallpapers: true
```

and re-run the `add`. Only grant this to packages you trust — it runs the package's code at install time.

No npm? The one-command PowerShell fallback (no git needed; downloads the newest GitHub Release, links it into the profile, and registers the plugin — safe to re-run):

```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest 'https://github.com/TTAWDTT/dsh-plugin-wallpapers/raw/main/install.ps1' -OutFile install.ps1; .\install.ps1"
```

From a local checkout instead:

```sh
git clone https://github.com/TTAWDTT/dsh-plugin-wallpapers.git
cd dsh-plugin-wallpapers && npm install && npm run build
dsh plugin --profile web add ./dsh-plugin-wallpapers
```

Reload the Web UI (or restart `dsh web`) afterwards.

## Use

1. `dsh web`, open the printed URL.
2. Settings → **General** → **Wallpaper** → **Choose**. Pick a wallpaper; the background starts playing immediately.
3. Toggle **Background audio** in the dialog (off by default), or **Clear** the selection to return to the plain palette.

Not installed Wallpaper Engine? The dialog says so; nothing else breaks. Wallpapers only play while the tab is open — the layer is removed the moment the page unloads, and the desktop is never involved.

## Config

Detection covers most setups; every knob is a config override in the profile's `cordis.patch.yml`:

```yaml
- id: ui-wallpaper
  config:
    steamLibraryRoots: ['D:\Steam', 'E:\SteamLibrary']  # default: registry + standard locations
    appId: '431960'                                     # Wallpaper Engine Steam app id
    bundledProjectsSubPath: 'projects/defaultprojects'  # bundled projects under the install
```

`steamLibraryRoots` entries hold `steamapps/libraryfolders.vdf`; empty (the default) enables the automatic detection.

## Develop

```sh
npm install
npm run build   # tsc (lib/ node half) + tsdown (lib/client.js browser bundle)
npm test        # vitest over the host test suite
```

After `npm run build`, restart `dsh web` to pick up changes.

## Layout

- `src/host/` — Wallpaper Engine discovery (registry + VDF + project.json parsing), the `/wallpapers` media routes with range streaming, and the self-mounted `/wallpapers-roster` RPC channel (the subscriptions pattern: `ctx.inject(['connection'], …)` + `connection.rpc.handle`; no core mounting).
- `src/client/` — the background layer (`<video>`/`<iframe>` stage + translucent theme override), the General-section row, and the picker dialog over a `defineStore` mirror of the roster.
- `src/wallpaper-settings.ts` — the durable `ui-wallpaper` settings section (selection + mute) shared by the host schema and the browser scope.
- `install.ps1` — npm-less Windows installer (GitHub Release zip → junction in the profile → patch registration).
