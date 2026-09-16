import { describe, expect, it } from 'vitest'
import { OVERLAY_MARGIN, OVERLAY_SIZE, bottomRightPosition } from './overlayBounds'

describe('bottomRightPosition', () => {
  it('workArea 우하단에서 여백만큼 안쪽', () => {
    const pos = bottomRightPosition({ x: 0, y: 25, width: 1440, height: 875 }, OVERLAY_SIZE, OVERLAY_MARGIN)
    expect(pos).toEqual({ x: 1440 - 360 - 16, y: 25 + 875 - 240 - 16 })
  })

  it('workArea 원점이 0이 아닐 때도 오프셋을 반영한다', () => {
    expect(bottomRightPosition({ x: -1920, y: 100, width: 1920, height: 1000 }, { width: 360, height: 240 }, 16))
      .toEqual({ x: -1920 + 1920 - 376, y: 100 + 1000 - 256 })
  })
})
