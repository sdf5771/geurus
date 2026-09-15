import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow, app, ipcMain, screen } from 'electron'
import { IPC } from '../shared/ipc'
import { applySetIgnoreMouse } from './ignoreMouse'
import { OVERLAY_MARGIN, OVERLAY_SIZE, bottomRightPosition } from './overlayBounds'
import { createTray } from './tray'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 빌드 산출물 구조
// ├─┬ dist-electron
// │ ├── main.js
// │ └── preload.mjs
// └─┬ dist
//   └── index.html
const APP_ROOT = path.join(__dirname, '..')
const RENDERER_DIST = path.join(APP_ROOT, 'dist')
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

let overlay: BrowserWindow | null = null

function createOverlayWindow(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay()
  const { x, y } = bottomRightPosition(workArea, OVERLAY_SIZE, OVERLAY_MARGIN)

  const win = new BrowserWindow({
    x,
    y,
    width: OVERLAY_SIZE.width,
    height: OVERLAY_SIZE.height,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // 번들된 preload.mjs는 확장자만 .mjs이고 내용은 CJS(require('electron'))다.
      // 샌드박스 preload는 CJS로 로드되므로 명시적으로 켠다(GitGrove에서 검증된 구성).
      sandbox: true,
    },
  })

  win.setAlwaysOnTop(true, 'screen-saver')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  // 기본은 클릭 통과. forward:true라 mousemove는 렌더러로 계속 온다(히트박스 판정용).
  win.setIgnoreMouseEvents(true, { forward: true })

  win.on('closed', () => {
    if (overlay === win) overlay = null
  })

  if (VITE_DEV_SERVER_URL) {
    void win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    void win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  return win
}

ipcMain.on(IPC.overlaySetIgnoreMouse, (event, payload: unknown) => {
  applySetIgnoreMouse(overlay, event.sender, payload)
})

app.on('window-all-closed', () => {
  app.quit()
})

void app.whenReady().then(() => {
  app.dock?.hide()
  createTray()
  overlay = createOverlayWindow()
})
