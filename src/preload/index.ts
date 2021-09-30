import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  execFfmpeg: (cmd: string) => ipcRenderer.invoke('execFfmpeg', cmd),
  killFfmpeg: () => ipcRenderer.invoke('killFfmpeg'),
  //rendererでの受信用, funcはコールバック関数//
  // eslint-disable-next-line @typescript-eslint/ban-types
  on: (channel: string, fn: Function) => {
    ipcRenderer.on(channel, (event, ...args) => fn(...args))
  },
})
