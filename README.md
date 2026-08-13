# Actuate

Mechanical keyboard sounds for any keyboard, on every physical keypress — even in background apps. Lives in the tray/menu bar.

## Run it

```
npm install
npm start
```

On first run, macOS will prompt for **Input Monitoring** (and possibly **Accessibility**) permission — grant it in System Settings → Privacy & Security, then relaunch. Until granted, the app hears no keys.

> Note: this can't be run/tested inside a sandboxed coding-agent session — global key hooks and GUI app launches require real OS permissions granted interactively on your machine. Run these commands in your normal Terminal.

If typing produces no sound at all (not even modifier keys register), check **Terminal → Secure Keyboard Entry** in the menu bar and turn it off — macOS blocks all global key hooks system-wide while it's on.

## Using the app

- Lives in the **menu bar (macOS)** / **system tray (Windows)** — no dock/taskbar window.
- Click the tray icon for: enable/disable, switch-sound picker, launch at login, and **Settings…**.
- Global hotkey **⌘/Ctrl+Alt+K** toggles sound on/off from anywhere.
- Settings window: enable toggle, switch-sound dropdown, volume slider, launch-at-login checkbox.
- Settings persist to `~/Library/Application Support/Actuate/settings.json` (macOS) or `%APPDATA%/Actuate/settings.json` (Windows).

## Sound packs

`sounds/packs/` ships 13 switch themes (Cherry MX Blue/Brown/Black, Holy Panda, Topre, Buckling Spring, etc.), sourced from the MIT-licensed [kbsim](https://github.com/tplai/kbsim) project. Each pack has:
- `press/GENERIC_R0..R4.mp3` — round-robin variants for ordinary keys
- `press/SPACE.mp3`, `ENTER.mp3`, `BACKSPACE.mp3` — dedicated big-key sounds
- `release/` — the same categories, played on keyup

`sounds/user-recorded/` holds 103 of your own recordings (`key_001.wav`…`key_103.wav`), not yet wired in — we need to know which physical key each file corresponds to before they can be mapped.

## Building installers

```
npm run dist:mac    # .dmg
npm run dist:win    # .exe (NSIS installer)
npm run dist        # both, for the current platform's target(s)
```

Output lands in `release/`. This is an **unsigned personal build** — no Apple notarization or Windows code signing:
- macOS: Gatekeeper will likely say **"Actuate.app is damaged and can't be opened"** — this is a false positive caused by the missing paid-developer signature plus the browser's quarantine flag, not actual corruption. Fix it in Terminal after moving the app to Applications: `xattr -cr /Applications/Actuate.app`. Then open normally (right-click → Open the first time if it still complains), and grant Input Monitoring/Accessibility when prompted.
- Windows: SmartScreen will warn once — "More info" → "Run anyway". AV may also flag it since a global key hook looks like a keylogger; that's expected.
- Building the Windows installer from a Mac may require Wine (`brew install --cask wine-stable`) for electron-builder's NSIS step — if that's friction, run `npm run dist:win` directly on a Windows machine instead.
- The tray icon is a placeholder generated in code (`src/main/icon.js`) — swap in real artwork whenever you want.
