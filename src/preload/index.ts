import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  execFfmpeg: async (cmd: string) =>
    await ipcRenderer.invoke('execFfmpeg', cmd),
  //rendererでの受信用, funcはコールバック関数//
  // eslint-disable-next-line @typescript-eslint/ban-types
  on: (channel: string, fn: Function) => {
    ipcRenderer.on(channel, (event, ...args) => fn(...args))
  },
})
