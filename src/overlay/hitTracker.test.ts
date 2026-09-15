import { describe, expect, it, vi } from 'vitest'
import { createHitTracker } from './hitTracker'

describe('createHitTracker', () => {
  it('초기 상태는 밖 — 밖에서 움직이면 호출하지 않는다', () => {
    const setIgnore = vi.fn()
    const tracker = createHitTracker(setIgnore)
    tracker.update(false)
    tracker.update(false)
    expect(tracker.isOver).toBe(false)
    expect(setIgnore).not.toHaveBeenCalled()
  })

  it('진입 시 false, 이탈 시 true — 상태가 바뀔 때만', () => {
    const setIgnore = vi.fn()
    const tracker = createHitTracker(setIgnore)
    tracker.update(true)
    tracker.update(true)
    tracker.update(true)
    expect(setIgnore.mock.calls).toEqual([[false]])
    tracker.update(false)
    tracker.update(false)
    expect(setIgnore.mock.calls).toEqual([[false], [true]])
  })

  it('창을 벗어나면(leave) 안에 있던 경우에만 true로 복귀', () => {
    const setIgnore = vi.fn()
    const tracker = createHitTracker(setIgnore)
    tracker.leave()
    expect(setIgnore).not.toHaveBeenCalled()
    tracker.update(true)
    tracker.leave()
    expect(setIgnore.mock.calls).toEqual([[false], [true]])
    expect(tracker.isOver).toBe(false)
    tracker.leave()
    expect(setIgnore).toHaveBeenCalledTimes(2)
  })

  it('sync: 마운트 시 이전 상태와 무관하게 true를 한 번 보내고 "밖"으로 맞춘다', () => {
    const setIgnore = vi.fn()
    const tracker = createHitTracker(setIgnore)
    tracker.sync()
    expect(setIgnore.mock.calls).toEqual([[true]])
    expect(tracker.isOver).toBe(false)
  })

  it('sync 뒤 진입하면 false를 보낸다 — 재로드 후 main이 false로 남아 있어도 상태가 다시 맞는다', () => {
    const setIgnore = vi.fn()
    const tracker = createHitTracker(setIgnore)
    tracker.update(true)
    tracker.sync()
    expect(tracker.isOver).toBe(false)
    tracker.update(true)
    tracker.update(false)
    expect(setIgnore.mock.calls).toEqual([[false], [true], [false], [true]])
  })
})
