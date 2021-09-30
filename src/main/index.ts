import os from 'os'
import path from 'path'
import { app, BrowserWindow, ipcMain, session } from 'electron'
import { spawnFfmpeg } from './ffmpeg'

const extPath =
  os.platform() === 'darwin'
    ? '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.13.2_0'
    : '/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.13.2_0'

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  }

  mainWindow.loadFile('dist/index.html')
}

app.whenReady().then(async () => {
  if (process.env.NODE_ENV === 'development') {
    await session.defaultSession
      .loadExtension(path.join(os.homedir(), extPath), {
        allowFileAccess: true,
      })
      .then(() => console.log('React Devtools loaded...'))
      .catch((err) => console.log(err))
  }

  createWindow()
})

app.once('window-all-closed', () => app.quit())

// ipc
ipcMain.handle('execFfmpeg', (event, data) => {
  return new Promise<void>((resolve, reject) => {
    spawnFfmpeg(
      data,
      (out) => {
        event.sender.send('ffmpegOut', out)
      },
      (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject({ code })
        }
      }
    )
  })
})
