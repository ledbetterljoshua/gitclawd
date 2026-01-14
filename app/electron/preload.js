const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openRepoDialog: () => ipcRenderer.invoke('open-repo-dialog')
})
