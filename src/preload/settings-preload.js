const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('actuateSettings', {
  get: () => ipcRenderer.invoke('settings:get'),
  set: (patch) => ipcRenderer.send('settings:set', patch),
  onChanged: (callback) => {
    ipcRenderer.on('settings-changed', (_event, payload) => callback(payload));
  },
});
