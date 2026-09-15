import { describe, expect, it } from 'vitest'
import { composeGrid } from '../sprite/compose'
import { boundsToCssRect, opaqueBounds } from '../sprite/hitbox'
import { CELL_H, cellSize } from '../sprite/raster'
import { cellOriginForAnchor, stageAnchor } from './placement'

describe('cellOriginForAnchor — 앵커 하단 중앙(8,16)', () => {
  it('셀 원점 = 앵커 − (PAD + 앵커) × 배율', () => {
    expect(cellOriginForAnchor({ x: 360, y: 444 }, 4)).toEqual({ x: 308, y: 352 })
    expect(cellOriginForAnchor({ x: 180, y: 222 }, 2)).toEqual({ x: 154, y: 176 })
  })
})

describe('stageAnchor', () => {
  it('가로 중앙, 셀 바닥이 캔버스 바닥에 닿는 높이', () => {
    const p = 4
    const anchor = stageAnchor(720, 480, p)
    expect(anchor).toEqual({ x: 360, y: 444 })
    const cell = cellOriginForAnchor(anchor, p)
    expect(cell.y + CELL_H * p).toBe(480)
  })

  it('정수 좌표만 낸다 (홀수 폭 포함)', () => {
    const anchor = stageAnchor(721, 481, 3)
    expect(Number.isInteger(anchor.x) && Number.isInteger(anchor.y)).toBe(true)
  })
})

describe('1단계 정지 렌더 히트박스 — dpr과 무관하게 같은 CSS 사각형', () => {
  const bounds = opaqueBounds(composeGrid('stand', 'pair', 'idle'))!

  it.each([1, 2])('360×240 창, ×2, dpr %i', (dpr) => {
    const { pixelScale } = cellSize(2, dpr)
    const cell = cellOriginForAnchor(stageAnchor(360 * dpr, 240 * dpr, pixelScale), pixelScale)
    expect(boundsToCssRect(bounds, cell.x, cell.y, pixelScale, dpr)).toEqual({
      left: 168,
      top: 192,
      right: 192,
      bottom: 222,
    })
  })
})
