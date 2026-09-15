import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import { applySetIgnoreMouse } from './ignoreMouse'
import {
  bindOverlayRecovery,
  createCrashReloadPolicy,
  goneReason,
  resetIgnoreMouse,
  type RecoverableOverlay,
} from './overlayRecovery'

function fakeOverlay() {
  let destroyed = false
  // 실제 창처럼 마지막으로 적용된 ignore 상태를 기억한다.
  const state = { ignore: true, forward: true }
  const webContents = Object.assign(new EventEmitter(), { reload: vi.fn() })
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

describe('bindOverlayRecovery — 재로드·크래시 뒤 클릭 통과 고착 회귀 (review Major-1 / qa B1)', () => {
  it('ignore=false 상태에서 재로드가 시작되면 IPC 없이도 클릭 통과로 돌아간다', () => {
    const { win, webContents, state } = fakeOverlay()
    bindOverlayRecovery(win)

    // 그루 위 커서 → 렌더러가 false 전송
    applySetIgnoreMouse(win, webContents, false)
    expect(state.ignore).toBe(false)

    // webContents.reload() → did-start-loading. 새 렌더러는 아직 IPC를 보내지 않는다.
    webContents.emit('did-start-loading')
    expect(state).toEqual({ ignore: true, forward: true })
  })

  it('렌더러 프로세스가 죽으면 클릭 통과로 돌아가고, 크래시면 재로드한다', () => {
    const { win, webContents, state } = fakeOverlay()
    const onGone = vi.fn()
    bindOverlayRecovery(win, { onGone, now: () => 0 })

    applySetIgnoreMouse(win, webContents, false)
    webContents.emit('render-process-gone', {}, { reason: 'crashed', exitCode: 11 })

    expect(state).toEqual({ ignore: true, forward: true })
    expect(webContents.reload).toHaveBeenCalledTimes(1)
    expect(onGone).toHaveBeenCalledWith('crashed', true)
  })

  it('clean-exit 등 재로드해도 소용없는 사유는 되돌리기만 하고 재로드하지 않는다', () => {
    const { win, webContents, state } = fakeOverlay()
    bindOverlayRecovery(win)

    applySetIgnoreMouse(win, webContents, false)
    webContents.emit('render-process-gone', {}, { reason: 'clean-exit', exitCode: 0 })

    expect(state.ignore).toBe(true)
    expect(webContents.reload).not.toHaveBeenCalled()
  })

  it('창이 파괴된 뒤의 이벤트는 무시한다', () => {
    const { win, webContents, setIgnoreMouseEvents, destroy } = fakeOverlay()
    bindOverlayRecovery(win)
    destroy()
    webContents.emit('did-start-loading')
    webContents.emit('render-process-gone', {}, { reason: 'crashed' })
    expect(setIgnoreMouseEvents).not.toHaveBeenCalled()
    expect(webContents.reload).not.toHaveBeenCalled()
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
