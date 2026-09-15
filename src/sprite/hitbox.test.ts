import { describe, expect, it } from 'vitest'
import { composeGrid } from './compose'
import { boundsToCssRect, isInsideRect, opaqueBounds, type Rect } from './hitbox'

describe('opaqueBounds', () => {
  it('stand + pair + idle: x 2~13, y 1~15 (잎 끝 ~ 뿌리 발)', () => {
    expect(opaqueBounds(composeGrid('stand', 'pair', 'idle'))).toEqual({
      minX: 2,
      minY: 1,
      maxX: 13,
      maxY: 15,
    })
  })

  it('렌더된 합성 그리드를 따른다 — sleepy zzz(4,14)가 오른쪽 경계를 넓힌다', () => {
    expect(opaqueBounds(composeGrid('stand', 'pair', 'sleepy'))?.maxX).toBe(14)
  })

  it('불투명 픽셀이 없으면 null', () => {
    expect(opaqueBounds(Array.from({ length: 18 }, () => '................'))).toBeNull()
  })
})

describe('boundsToCssRect', () => {
  const bounds = { minX: 2, minY: 1, maxX: 13, maxY: 15 }

  it('패딩을 더해 기기 픽셀로, dpr로 나눠 CSS 픽셀로 환산', () => {
    expect(boundsToCssRect(bounds, 0, 0, 4, 2)).toEqual({ left: 14, top: 16, right: 38, bottom: 46 })
    expect(boundsToCssRect(bounds, 308, 352, 4, 2)).toEqual({
      left: 168,
      top: 192,
      right: 192,
      bottom: 222,
    })
  })
})

describe('isInsideRect', () => {
  const rect: Rect = { left: 168, top: 192, right: 192, bottom: 222 }

  it('안', () => {
    expect(isInsideRect(rect, 180, 200)).toBe(true)
    expect(isInsideRect(rect, 191.5, 221.9)).toBe(true)
  })

  it('밖', () => {
    expect(isInsideRect(rect, 100, 200)).toBe(false)
    expect(isInsideRect(rect, 180, 100)).toBe(false)
    expect(isInsideRect(rect, 300, 230)).toBe(false)
  })

  it('경계: left·top은 포함, right·bottom은 제외', () => {
    expect(isInsideRect(rect, 168, 192)).toBe(true)
    expect(isInsideRect(rect, 167.9, 200)).toBe(false)
    expect(isInsideRect(rect, 180, 191.9)).toBe(false)
    expect(isInsideRect(rect, 192, 200)).toBe(false)
    expect(isInsideRect(rect, 180, 222)).toBe(false)
  })

  it('히트박스가 없으면 항상 밖', () => {
    expect(isInsideRect(null, 0, 0)).toBe(false)
  })
})
