// Phase 2-4: tray-resident background app.
// Global key hook -> filtered/categorized -> hidden Web Audio renderer.
// No key text is ever captured — only raw keycodes.

const path = require('path');
const { pathToFileURL } = require('url');
const { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut } = require('electron');
const { uIOhook } = require('uiohook-napi');
const { Store } = require('./store');
const { PACKS, packDir } = require('./packs');
const { categoryFor, nameFor } = require('./keymap');
const { keyboardTrayIcon } = require('./icon');

const TOGGLE_HOTKEY = 'CommandOrControl+Alt+K';

let store;
let tray;
let audioWindow;
let settingsWindow;
const heldKeys = new Set();

function pushStateToAudioWindow() {
  if (!audioWindow) return;
  audioWindow.webContents.send('settings-changed', {
    enabled: store.all.enabled,
    volume: store.all.volume,
    packUrl: pathToFileURL(packDir(store.all.pack)).href,
  });
}

function syncLoginItem() {
  app.setLoginItemSettings({ openAtLogin: store.all.launchAtLogin });
}

function updateSettings(patch) {
  store.set(patch);
  pushStateToAudioWindow();
  syncLoginItem();
  buildTrayMenu();
  if (settingsWindow) {
    settingsWindow.webContents.send('settings-changed', store.all);
  }
}

function buildTrayMenu() {
  const { enabled, pack, launchAtLogin } = store.all;

  const packItems = PACKS.map((p) => ({
    label: p.caption,
    type: 'radio',
    checked: pack === p.id,
    click: () => updateSettings({ pack: p.id }),
  }));

  const menu = Menu.buildFromTemplate([
    {
      label: enabled ? 'Enabled' : 'Disabled',
      type: 'checkbox',
      checked: enabled,
      click: (item) => updateSettings({ enabled: item.checked }),
    },
    { type: 'separator' },
    { label: 'Switch Sound', submenu: packItems },
    { type: 'separator' },
    {
      label: 'Launch at Login',
      type: 'checkbox',
      checked: launchAtLogin,
      click: (item) => updateSettings({ launchAtLogin: item.checked }),
    },
    { label: 'Settings…', click: openSettingsWindow },
    { type: 'separator' },
    { label: 'Quit Actuate', click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
}

function openSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }
  settingsWindow = new BrowserWindow({
    width: 360,
    height: 340,
    resizable: false,
    title: 'Actuate Settings',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'settings-preload.js'),
      contextIsolation: true,
    },
  });
  settingsWindow.setMenuBarVisibility(false);
  settingsWindow.loadFile(path.join(__dirname, '..', 'renderer', 'settings.html'));
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createAudioWindow() {
  audioWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'audio-preload.js'),
      contextIsolation: true,
    },
  });
  audioWindow.loadFile(path.join(__dirname, '..', 'renderer', 'audio.html'));
  audioWindow.webContents.on('console-message', (_event, _level, message) => {
    console.log('[audio]', message);
  });
  audioWindow.webContents.once('did-finish-load', pushStateToAudioWindow);
}

function startHook() {
  const forward = (type) => (e) => {
    // Auto-repeat filtering: a held physical key streams repeated OS keydowns,
    // but a real switch only clicks once per physical actuation.
    if (type === 'down') {
      if (heldKeys.has(e.keycode)) return;
      heldKeys.add(e.keycode);
    } else {
      heldKeys.delete(e.keycode);
    }

    if (!audioWindow) return;
    audioWindow.webContents.send('key-event', {
      type,
      keycode: e.keycode,
      name: nameFor(e.keycode),
      category: categoryFor(e.keycode),
      t: Date.now(),
    });
  };

  uIOhook.on('keydown', forward('down'));
  uIOhook.on('keyup', forward('up'));

  try {
    uIOhook.start();
  } catch (err) {
    console.error('\nGlobal hook failed to start — this is almost always a missing permission.');
    console.error('macOS: System Settings -> Privacy & Security -> Accessibility (and Input Monitoring)');
    console.error('Add/enable the app there, then quit (Ctrl+C) and run `npm start` again.\n');
  }
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }

  store = new Store(app.getPath('userData'));

  tray = new Tray(keyboardTrayIcon());
  tray.setToolTip('Actuate');
  buildTrayMenu();

  createAudioWindow();
  startHook();
  syncLoginItem();

  globalShortcut.register(TOGGLE_HOTKEY, () => {
    updateSettings({ enabled: !store.all.enabled });
  });

  ipcMain.handle('settings:get', () => ({ ...store.all, packs: PACKS }));
  ipcMain.on('settings:set', (_event, patch) => updateSettings(patch));

  console.log('Actuate running in the tray/menu bar. Toggle with ' + TOGGLE_HOTKEY + '.');
});

app.on('window-all-closed', () => {
  // Background app — no visible windows required, so don't quit on this event.
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  uIOhook.stop();
});
