import { describe, expect, it, vi } from 'vitest'
import { applySetIgnoreMouse, resolveIgnoreMouse, type IgnoreMouseTarget } from './ignoreMouse'

function fakeWindow(destroyed = false) {
  const webContents = { id: 1 }
  const setIgnoreMouseEvents = vi.fn()
  const target: IgnoreMouseTarget = {
    webContents,
    isDestroyed: () => destroyed,
    setIgnoreMouseEvents,
  }
  return { target, webContents, setIgnoreMouseEvents }
}

describe('resolveIgnoreMouse', () => {
  it('true → forward 옵션과 함께 무시', () => {
    expect(resolveIgnoreMouse(true)).toEqual({ ignore: true, options: { forward: true } })
  })

  it('false → 클릭 받음(옵션 없음)', () => {
    expect(resolveIgnoreMouse(false)).toEqual({ ignore: false })
  })

  it.each([undefined, null, 0, 1, 'true', 'false', {}, [], [true]])(
    'boolean이 아닌 payload(%j)는 무시',
    (payload) => {
      expect(resolveIgnoreMouse(payload)).toBeNull()
    },
  )
})

describe('applySetIgnoreMouse', () => {
  it('true: setIgnoreMouseEvents(true, { forward: true })', () => {
    const { target, webContents, setIgnoreMouseEvents } = fakeWindow()
    expect(applySetIgnoreMouse(target, webContents, true)).toBe(true)
    expect(setIgnoreMouseEvents).toHaveBeenCalledTimes(1)
    expect(setIgnoreMouseEvents).toHaveBeenCalledWith(true, { forward: true })
  })

  it('false: setIgnoreMouseEvents(false) — 두 번째 인자 없음', () => {
    const { target, webContents, setIgnoreMouseEvents } = fakeWindow()
    expect(applySetIgnoreMouse(target, webContents, false)).toBe(true)
    expect(setIgnoreMouseEvents).toHaveBeenCalledTimes(1)
    expect(setIgnoreMouseEvents.mock.calls[0]).toEqual([false])
  })

  it('boolean이 아닌 payload는 호출하지 않는다', () => {
    const { target, webContents, setIgnoreMouseEvents } = fakeWindow()
    expect(applySetIgnoreMouse(target, webContents, 'false')).toBe(false)
    expect(applySetIgnoreMouse(target, webContents, 0)).toBe(false)
    expect(applySetIgnoreMouse(target, webContents, undefined)).toBe(false)
    expect(setIgnoreMouseEvents).not.toHaveBeenCalled()
  })

  it('오버레이 창이 아닌 sender는 무시한다', () => {
    const { target, setIgnoreMouseEvents } = fakeWindow()
    expect(applySetIgnoreMouse(target, { id: 1 }, true)).toBe(false)
    expect(setIgnoreMouseEvents).not.toHaveBeenCalled()
  })

  it('창이 없거나 파괴됐으면 무시한다', () => {
    expect(applySetIgnoreMouse(null, {}, true)).toBe(false)
    const { target, webContents, setIgnoreMouseEvents } = fakeWindow(true)
    expect(applySetIgnoreMouse(target, webContents, true)).toBe(false)
    expect(setIgnoreMouseEvents).not.toHaveBeenCalled()
  })
})
