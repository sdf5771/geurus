import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import { applySetIgnoreMouse } from './ignoreMouse'
import {
  bindOverlayRecovery,
  createCrashReloadPolicy,
  goneReason,
  isAllowedNavigation,
  resetIgnoreMouse,
  type RecoverableOverlay,
} from './overlayRecovery'

const APP_URL = 'file:///Users/me/geurus/dist/index.html'
const EXTERNAL = 'https://example.com/'

function fakeOverlay(currentUrl = APP_URL) {
  let destroyed = false
  // 실제 창처럼 마지막으로 적용된 ignore 상태를 기억한다.
  const state = { ignore: true, forward: true }
  const webContents = Object.assign(new EventEmitter(), {
    reload: vi.fn(),
    getURL: () => currentUrl,
  })
  const setIgnoreMouseEvents = vi.fn((ignore: boolean, options?: { forward?: boolean }) => {
    state.ignore = ignore
    state.forward = options?.forward === true
  })
  const win: RecoverableOverlay = {
    webContents,
    isDestroyed: () => destroyed,
    setIgnoreMouseEvents,
  }
  return { win, webContents, state, setIgnoreMouseEvents, destroy: () => (destroyed = true) }
}

function navEvent() {
  return { preventDefault: vi.fn() }
}

/** 그루 위 커서 → 렌더러가 false 전송한 상태를 만든다 */
function hoverGeuru(f: ReturnType<typeof fakeOverlay>) {
  applySetIgnoreMouse(f.win, f.webContents, false)
  expect(f.state.ignore).toBe(false)
}

describe('resetIgnoreMouse', () => {
  it('클릭 통과(forward)로 되돌린다', () => {
    const { win, setIgnoreMouseEvents } = fakeOverlay()
    expect(resetIgnoreMouse(win)).toBe(true)
    expect(setIgnoreMouseEvents).toHaveBeenCalledWith(true, { forward: true })
  })

  it('창이 없거나 파괴됐으면 아무것도 하지 않는다', () => {
    expect(resetIgnoreMouse(null)).toBe(false)
    const { win, setIgnoreMouseEvents, destroy } = fakeOverlay()
    destroy()
    expect(resetIgnoreMouse(win)).toBe(false)
    expect(setIgnoreMouseEvents).not.toHaveBeenCalled()
  })
})

describe('isAllowedNavigation', () => {
  it('빌드: 앱 index와 같은 문서(해시 무시)만 허용', () => {
    const scope = { appUrl: APP_URL }
    expect(isAllowedNavigation(APP_URL, scope)).toBe(true)
    expect(isAllowedNavigation(`${APP_URL}#top`, scope)).toBe(true)
    expect(isAllowedNavigation(EXTERNAL, scope)).toBe(false)
    expect(isAllowedNavigation('file:///etc/passwd', scope)).toBe(false)
    expect(isAllowedNavigation('file:///Users/me/geurus/dist/other.html', scope)).toBe(false)
  })

  it('dev: dev 서버 origin 안의 탐색은 허용, 다른 origin·포트는 차단', () => {
    const scope = { appUrl: 'http://localhost:5173/', devOrigin: 'http://localhost:5173/' }
    expect(isAllowedNavigation('http://localhost:5173/', scope)).toBe(true)
    expect(isAllowedNavigation('http://localhost:5173/index.html?t=1', scope)).toBe(true)
    expect(isAllowedNavigation('http://localhost:5174/', scope)).toBe(false)
    expect(isAllowedNavigation(EXTERNAL, scope)).toBe(false)
  })

  it('현재 문서 URL과 같으면 허용', () => {
    expect(isAllowedNavigation('file:///x/index.html', { appUrl: APP_URL, currentUrl: 'file:///x/index.html#a' })).toBe(true)
  })

  it('형식이 잘못된 URL은 차단', () => {
    expect(isAllowedNavigation('not a url', { appUrl: APP_URL })).toBe(false)
    expect(isAllowedNavigation('', { appUrl: APP_URL })).toBe(false)
  })
})

// 아래 시나리오는 Electron 30에서 실측한 main frame 이벤트 순서를 그대로 재생한다.
describe('bindOverlayRecovery — 실측 이벤트 순서 재생', () => {
  it('[qa N1] 막힌 외부 탐색: 차단하고 ignore=false를 유지한다', () => {
    const f = fakeOverlay()
    bindOverlayRecovery(f.win, { scope: { appUrl: APP_URL } })
    hoverGeuru(f)

    const ev = navEvent()
    f.webContents.emit('did-start-loading')
    f.webContents.emit('did-start-navigation', {}, EXTERNAL, false, true)
    f.webContents.emit('will-navigate', ev, EXTERNAL)
    f.webContents.emit('did-stop-loading')

    expect(ev.preventDefault).toHaveBeenCalledTimes(1)
    expect(f.state.ignore).toBe(false)
  })

  it('[review M-A] 렌더러 location.reload(): 차단하지 않고, 커밋 시 클릭 통과로 되돌린다', () => {
    const f = fakeOverlay()
    bindOverlayRecovery(f.win, { scope: { appUrl: APP_URL } })
    hoverGeuru(f)

    const ev = navEvent()
    f.webContents.emit('did-start-loading')
    f.webContents.emit('did-start-navigation', {}, APP_URL, false, true)
    f.webContents.emit('will-navigate', ev, APP_URL)
    expect(ev.preventDefault).not.toHaveBeenCalled()
    expect(f.state.ignore).toBe(false) // 커밋 전: 이전 문서가 아직 살아 있음
    f.webContents.emit('did-frame-navigate')
    f.webContents.emit('did-navigate', {}, APP_URL)
    f.webContents.emit('dom-ready')

    expect(f.state).toEqual({ ignore: true, forward: true })
  })

  it('dev Vite full reload(dev origin): 허용하고 되돌린다', () => {
    const dev = 'http://localhost:5173/'
    const f = fakeOverlay(dev)
    bindOverlayRecovery(f.win, { scope: { appUrl: dev, devOrigin: dev } })
    hoverGeuru(f)

    const ev = navEvent()
    f.webContents.emit('will-navigate', ev, dev)
    f.webContents.emit('did-navigate', {}, dev)

    expect(ev.preventDefault).not.toHaveBeenCalled()
    expect(f.state.ignore).toBe(true)
  })

  it('main webContents.reload(): will-navigate 없이 커밋 시 되돌린다', () => {
    const f = fakeOverlay()
    bindOverlayRecovery(f.win, { scope: { appUrl: APP_URL } })
    hoverGeuru(f)

    f.webContents.emit('did-start-loading')
    f.webContents.emit('did-start-navigation', {}, APP_URL, false, true)
    f.webContents.emit('did-frame-navigate')
    f.webContents.emit('did-navigate', {}, APP_URL)

    expect(f.state).toEqual({ ignore: true, forward: true })
  })

  it('same-document 탐색(해시·pushState): 되돌리지 않는다', () => {
    const f = fakeOverlay()
    bindOverlayRecovery(f.win, { scope: { appUrl: APP_URL } })
    hoverGeuru(f)

    f.webContents.emit('did-start-loading')
    f.webContents.emit('did-start-navigation', {}, `${APP_URL}#x`, true, true)
    f.webContents.emit('did-navigate-in-page', {}, `${APP_URL}#x`, true)
    f.webContents.emit('did-stop-loading')

    expect(f.state.ignore).toBe(false)
  })

  it('크래시: 즉시 되돌린 뒤 재로드하고, 재로드 커밋에서도 통과 상태를 유지한다', () => {
    const f = fakeOverlay()
    const onGone = vi.fn()
    bindOverlayRecovery(f.win, { scope: { appUrl: APP_URL }, onGone, now: () => 0 })
    hoverGeuru(f)

    f.webContents.emit('render-process-gone', {}, { reason: 'crashed', exitCode: 11 })
    expect(f.state).toEqual({ ignore: true, forward: true })
    expect(f.webContents.reload).toHaveBeenCalledTimes(1)
    expect(onGone).toHaveBeenCalledWith('crashed', true)

    f.webContents.emit('did-start-loading')
    f.webContents.emit('did-navigate', {}, APP_URL)
    expect(f.state.ignore).toBe(true)
  })

  it('clean-exit 등 재로드해도 소용없는 사유는 되돌리기만 하고 재로드하지 않는다', () => {
    const f = fakeOverlay()
    bindOverlayRecovery(f.win, { scope: { appUrl: APP_URL } })
    hoverGeuru(f)

    f.webContents.emit('render-process-gone', {}, { reason: 'clean-exit', exitCode: 0 })

    expect(f.state.ignore).toBe(true)
    expect(f.webContents.reload).not.toHaveBeenCalled()
  })

  it('차단된 탐색은 onBlockedNavigation으로 알린다', () => {
    const f = fakeOverlay()
    const onBlockedNavigation = vi.fn()
    bindOverlayRecovery(f.win, { scope: { appUrl: APP_URL }, onBlockedNavigation })
    f.webContents.emit('will-navigate', navEvent(), EXTERNAL)
    expect(onBlockedNavigation).toHaveBeenCalledWith(EXTERNAL)
  })

  it('창이 파괴된 뒤의 이벤트는 되돌리기·재로드를 하지 않는다', () => {
    const f = fakeOverlay()
    bindOverlayRecovery(f.win, { scope: { appUrl: APP_URL } })
    f.destroy()
    f.webContents.emit('did-navigate', {}, APP_URL)
    f.webContents.emit('render-process-gone', {}, { reason: 'crashed' })
    expect(f.setIgnoreMouseEvents).not.toHaveBeenCalled()
    expect(f.webContents.reload).not.toHaveBeenCalled()
  })
})

describe('createCrashReloadPolicy', () => {
  it('재로드 가능한 사유만 허용한다', () => {
    const allow = createCrashReloadPolicy({ maxReloads: 10, windowMs: 1000 })
    for (const reason of ['crashed', 'oom', 'abnormal-exit', 'killed']) {
      expect(allow(reason, 0)).toBe(true)
    }
    for (const reason of ['clean-exit', 'launch-failed', 'integrity-failure', 'unknown']) {
      expect(allow(reason, 0)).toBe(false)
    }
  })

  it('시간 창 안에서 최대 횟수를 넘으면 멈추고, 창이 지나면 다시 허용한다 (크래시 루프 방지)', () => {
    const allow = createCrashReloadPolicy({ maxReloads: 3, windowMs: 60_000 })
    expect(allow('crashed', 0)).toBe(true)
    expect(allow('crashed', 1_000)).toBe(true)
    expect(allow('crashed', 2_000)).toBe(true)
    expect(allow('crashed', 3_000)).toBe(false)
    expect(allow('crashed', 59_999)).toBe(false)
    expect(allow('crashed', 60_000)).toBe(true) // t=0 기록이 창 밖으로 빠짐
  })
})

describe('goneReason', () => {
  it('details.reason 문자열을 꺼내고, 형식이 다르면 unknown', () => {
    expect(goneReason({ reason: 'oom' })).toBe('oom')
    expect(goneReason({ reason: 1 })).toBe('unknown')
    expect(goneReason(null)).toBe('unknown')
    expect(goneReason(undefined)).toBe('unknown')
  })
})
