import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import http from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine if we're running in packaged app or development
const isPackaged = app.isPackaged

let mainWindow
let serverProcess
let weStartedServer = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d0d0d',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // In development, load from vite dev server
  // In production, load from the built files via our express server
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // Load from the express server
    mainWindow.loadURL('http://localhost:3456')
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function startServer() {
  // In packaged app, server is in resources/server
  // In development, it's in ../web relative to the app folder
  let serverPath, serverCwd

  if (isPackaged) {
    serverCwd = path.join(process.resourcesPath, 'server')
    serverPath = path.join(serverCwd, 'server.js')
  } else {
    serverCwd = path.join(__dirname, '../../web')
    serverPath = path.join(serverCwd, 'server.js')
  }

  console.log('Starting server from:', serverPath)

  serverProcess = spawn('node', [serverPath], {
    cwd: serverCwd,
    stdio: 'inherit'
  })

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err)
  })

  weStartedServer = true
}

// Check if server is already running
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3456/api/repo-info', (res) => {
      resolve(true)
    })
    req.on('error', () => {
      resolve(false)
    })
    req.setTimeout(1000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

// Handle open repo dialog
ipcMain.handle('open-repo-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Open Git Repository'
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

app.whenReady().then(async () => {
  const serverRunning = await checkServerRunning()

  if (!serverRunning) {
    startServer()
    // Give server a moment to start
    setTimeout(createWindow, 1500)
  } else {
    console.log('Server already running, connecting...')
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (weStartedServer && serverProcess) {
    serverProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (weStartedServer && serverProcess) {
    serverProcess.kill()
  }
})
