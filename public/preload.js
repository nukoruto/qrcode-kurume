const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveImage: (imageDataUrl) => ipcRenderer.send('save-image', imageDataUrl)
});
