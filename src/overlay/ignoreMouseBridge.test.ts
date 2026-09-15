import { describe, expect, it, vi } from 'vitest'
import { createIgnoreMouseSender } from './ignoreMouseBridge'

describe('createIgnoreMouseSender', () => {
  it('브리지가 있으면 payload를 그대로 전달하고 경고하지 않는다', () => {
    const setIgnoreMouseEvents = vi.fn()
    const onMissing = vi.fn()
    const send = createIgnoreMouseSender(() => ({ setIgnoreMouseEvents }), onMissing)
    send(true)
    send(false)
    expect(setIgnoreMouseEvents.mock.calls).toEqual([[true], [false]])
    expect(onMissing).not.toHaveBeenCalled()
  })

  it('브리지가 없으면 여러 번 호출해도 onMissing은 한 번만', () => {
    const onMissing = vi.fn()
    const send = createIgnoreMouseSender(() => undefined, onMissing)
    send(true)
    send(false)
    send(true)
    expect(onMissing).toHaveBeenCalledTimes(1)
  })

  it('호출 시점마다 브리지를 다시 조회한다', () => {
    const setIgnoreMouseEvents = vi.fn()
    let bridge: { setIgnoreMouseEvents: (ignore: boolean) => void } | undefined
    const onMissing = vi.fn()
    const send = createIgnoreMouseSender(() => bridge, onMissing)
    send(true)
    bridge = { setIgnoreMouseEvents }
    send(true)
    expect(onMissing).toHaveBeenCalledTimes(1)
    expect(setIgnoreMouseEvents.mock.calls).toEqual([[true]])
  })
})
