# Actuate

Mechanical keyboard sounds for any keyboard, on every physical keypress — even in background apps. Lives in the tray/menu bar.

## Run it

```
npm install
npm start
```

On first run, macOS will prompt for **Input Monitoring** (and possibly **Accessibility**) permission — grant it in System Settings → Privacy & Security, then relaunch. Until granted, the app hears no keys.

> Note: this can't be run/tested inside a sandboxed coding-agent session — global key hooks and GUI app launches require real OS permissions granted interactively on your machine. Run these commands in your normal Terminal.

Running into no sound, or only some keys working? See **Troubleshooting** below.

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
- macOS: the DMG includes a **"Fix Gatekeeper Warning.command"** script — see **Troubleshooting** below for what it does and the Gatekeeper "damaged" dialog you'll hit on first launch without it.
- Windows: SmartScreen will warn once — "More info" → "Run anyway". AV may also flag it since a global key hook looks like a keylogger; that's expected.
- Building the Windows installer from a Mac may require Wine (`brew install --cask wine-stable`) for electron-builder's NSIS step — if that's friction, run `npm run dist:win` directly on a Windows machine instead.
- The tray icon and app icon are placeholders generated in code (`src/main/icon.js`, `build/icon.png`) — swap in real artwork whenever you want.

## Troubleshooting

**macOS says "Actuate.app is damaged and can't be opened"**
False positive, not real corruption. Browsers tag downloaded files with a "quarantine" flag, and without a paid Apple Developer signature, Gatekeeper on Apple Silicon refuses to even show the usual "unidentified developer" prompt — it jumps straight to "damaged" instead. The DMG ships a **"Fix Gatekeeper Warning.command"** script alongside Actuate.app for this: after dragging Actuate to Applications, double-click the script (Terminal will ask you to confirm running it once — that's the normal unsigned-script prompt, click Open) and it clears the flag for you.

If you'd rather do it by hand, or the script itself won't open:
```
xattr -cr /Applications/Actuate.app
```
`xattr` reads/writes a file's extended attributes; `-c` clears all of them (which removes the quarantine flag Gatekeeper checks), and `-r` applies that recursively through the app bundle, since it's really a folder of files rather than one file. Once cleared, open the app normally (right-click → Open the first time if it still complains), then grant Input Monitoring/Accessibility when prompted.

**Only modifier keys (Shift/Ctrl/Cmd) or function keys make sound — letters and numbers don't**
This is **macOS Secure Keyboard Entry**, not a bug in Actuate. When it's active anywhere on the system, macOS blocks every global key hook from seeing character-producing keys, while still letting non-text keys (modifiers, most function keys) through — producing exactly this pattern.
- Check **Terminal → Secure Keyboard Entry** in the menu bar (also check iTerm2 if you use it). It stays active as long as that window/app is open, even if it's not the focused app — close it or turn the setting off.
- Quit password managers (1Password, Bitwarden, etc.) or remote-desktop/screen-sharing tools, which sometimes hold secure input on.
- If neither works, reboot — secure input can get stuck on if whatever enabled it crashed without releasing it.

**No sound at all, for any key**
Input Monitoring/Accessibility permission hasn't been granted yet — see "Run it" above, or for the packaged app, System Settings → Privacy & Security → Input Monitoring / Accessibility.
