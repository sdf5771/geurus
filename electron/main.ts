import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
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
const RENDERER_INDEX = path.join(APP_ROOT, 'dist', 'index.html')
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

  // 앱 범위 밖 탐색만 차단(같은 문서 재로드는 허용)하고, 새 문서 커밋·크래시 때 클릭 통과로 되돌린다.
  bindOverlayRecovery(win, {
    scope: {
      appUrl: DEV_SERVER_URL ?? pathToFileURL(RENDERER_INDEX).href,
      devOrigin: DEV_SERVER_URL,
    },
    onGone: (reason, reloading) => {
      console.error(`[geurus] renderer gone: ${reason}${reloading ? ' → reload' : ''}`)
    },
    onBlockedNavigation: (url) => {
      if (!app.isPackaged) console.warn(`[geurus] blocked navigation: ${url}`)
    },
  })
  // 오버레이는 새 창을 열 일이 없다.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  win.once('ready-to-show', () => {
    if (!win.isDestroyed()) win.showInactive()
  })

  win.on('closed', () => {
    if (overlay === win) overlay = null
  })

  const load = DEV_SERVER_URL ? win.loadURL(DEV_SERVER_URL) : win.loadFile(RENDERER_INDEX)
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

/**
 * 단일 인스턴스 잠금은 dev 서버 모드에서 걸지 않는다.
 * vite-plugin-electron은 main.ts가 바뀌면 이전 인스턴스에 SIGTERM을 보내고 기다리지 않은 채 새 인스턴스를 띄운다.
 * 실측(Electron 30): 이전 인스턴스가 종료 중일 때 새 인스턴스의 requestSingleInstanceLock()은 true를 반환하지만
 * app 'ready'가 끝내 오지 않아 창 없는 프로세스로 남았다(저장 10회 중 5회 + 원복 1회). 잠금을 생략하면 11/11 정상.
 */
const gotLock = DEV_SERVER_URL !== null || app.requestSingleInstanceLock()

if (!gotLock) {
  console.warn('[geurus] another instance holds the single-instance lock; quitting')
  app.quit()
} else {
  ipcMain.on(IPC.overlaySetIgnoreMouse, (event, payload: unknown) => {
    applySetIgnoreMouse(overlay, event.sender, payload)
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  void app.whenReady().then(() => {
    // 기본 앱 메뉴 제거 → ⌘R(재로드)·⌘W(닫기)·⌥⌘I(DevTools) 단축키 비활성.
    // 4단계에 입력 UI(설정 창 등)가 생기면 macOS 복사·붙여넣기용 role:'editMenu' 최소 메뉴가 필요하다.
    Menu.setApplicationMenu(null)
    app.dock?.hide()
    createTray()
    overlay = createOverlayWindow()
  })
}
