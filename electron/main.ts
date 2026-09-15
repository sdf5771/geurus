import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow, Menu, app, ipcMain, screen } from 'electron'
import { IPC } from '../shared/ipc'
import { applySetIgnoreMouse } from './ignoreMouse'
import { OVERLAY_MARGIN, OVERLAY_SIZE, bottomRightPosition } from './overlayBounds'
import { bindOverlayRecovery } from './overlayRecovery'
import { createTray } from './tray'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 빌드 산출물 구조
// ├─┬ dist-electron
// │ ├── main.js
// │ └── preload.cjs
// └─┬ dist
//   └── index.html
const APP_ROOT = path.join(__dirname, '..')
const RENDERER_DIST = path.join(APP_ROOT, 'dist')
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
// 패키징된 앱은 환경변수가 있어도 dev 서버를 로드하지 않는다.
const DEV_SERVER_URL = !app.isPackaged && VITE_DEV_SERVER_URL ? VITE_DEV_SERVER_URL : null
// dev 전용 DevTools 자동 열기: `GEURUS_DEVTOOLS=1 npm run dev`. 앱 메뉴를 없애 단축키로는 열 수 없다.
const OPEN_DEVTOOLS = DEV_SERVER_URL !== null && process.env['GEURUS_DEVTOOLS'] === '1'

let overlay: BrowserWindow | null = null

function createOverlayWindow(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay()
  const { x, y } = bottomRightPosition(workArea, OVERLAY_SIZE, OVERLAY_MARGIN)

  const win = new BrowserWindow({
    x,
    y,
    width: OVERLAY_SIZE.width,
    height: OVERLAY_SIZE.height,
    // 생성 즉시 show하면 앱이 frontmost가 되고 창이 포커스를 가져간다. 로드 뒤 showInactive로 띄운다.
    show: false,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    // macOS에서는 효과가 없다(작업 표시줄은 Windows 개념, 독은 app.dock.hide()로 숨김). 크로스플랫폼 대비로 둔다.
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // 샌드박스 preload는 CJS로 로드된다(preload.cjs).
      sandbox: true,
      devTools: !app.isPackaged,
    },
  })

  win.setAlwaysOnTop(true, 'screen-saver')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  // 기본은 클릭 통과. forward:true라 mousemove는 렌더러로 계속 온다(히트박스 판정용).
  win.setIgnoreMouseEvents(true, { forward: true })

  // 재로드·크래시 뒤 ignore=false가 남지 않게 되돌리고, 크래시는 제한된 횟수만 재로드한다.
  bindOverlayRecovery(win, {
    onGone: (reason, reloading) => {
      console.error(`[geurus] renderer gone: ${reason}${reloading ? ' → reload' : ''}`)
    },
  })

  // 오버레이는 다른 페이지로 이동하거나 새 창을 열 일이 없다.
  win.webContents.on('will-navigate', (event) => {
    event.preventDefault()
  })
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  win.once('ready-to-show', () => {
    if (!win.isDestroyed()) win.showInactive()
  })

  win.on('closed', () => {
    if (overlay === win) overlay = null
  })

  const load = DEV_SERVER_URL
    ? win.loadURL(DEV_SERVER_URL)
    : win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  load
    .then(() => {
      if (OPEN_DEVTOOLS && !win.isDestroyed()) {
        win.webContents.openDevTools({ mode: 'detach', activate: false })
      }
    })
    .catch((error: unknown) => {
      console.error('[geurus] overlay load failed:', error)
    })

  return win
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  ipcMain.on(IPC.overlaySetIgnoreMouse, (event, payload: unknown) => {
    applySetIgnoreMouse(overlay, event.sender, payload)
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  void app.whenReady().then(() => {
    // 기본 앱 메뉴 제거 → ⌘R(재로드)·⌘W(닫기)·⌥⌘I(DevTools) 단축키 비활성
    Menu.setApplicationMenu(null)
    app.dock?.hide()
    createTray()
    overlay = createOverlayWindow()
  })
}
