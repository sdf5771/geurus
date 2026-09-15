import { describe, expect, it } from 'vitest'
import { composeGrid } from './compose'
import { PAL, colorOf, type PalKey } from './palette'
import {
  CELL_H,
  CELL_W,
  PAD_X,
  PAD_Y,
  cellSize,
  paintSprite,
  pixelScaleFor,
  type PixelSink,
} from './raster'

interface FillCall {
  color: string
  x: number
  y: number
  w: number
  h: number
}

function recordingSink(): { sink: PixelSink; calls: FillCall[] } {
  const calls: FillCall[] = []
  const sink = {
    fillStyle: '' as PixelSink['fillStyle'],
    fillRect(x: number, y: number, w: number, h: number) {
      calls.push({ color: String(sink.fillStyle), x, y, w, h })
    },
  }
  return { sink, calls }
}

describe('셀 좌표계', () => {
  it('패딩 포함 셀 = (16 + 2·5) × (18 + 2·7) = 26 × 32', () => {
    expect(PAD_X).toBe(5)
    expect(PAD_Y).toBe(7)
    expect(CELL_W).toBe(26)
    expect(CELL_H).toBe(32)
  })
})

describe('cellSize — scale × dpr, 패딩 포함', () => {
  it.each([
    [1, 1, 1, 26, 32],
    [2, 1, 2, 52, 64],
    [3, 1, 3, 78, 96],
    [1, 2, 2, 52, 64],
    [2, 2, 4, 104, 128],
    [3, 2, 6, 156, 192],
    [2, 3, 6, 156, 192],
  ])('scale %i × dpr %d → 픽셀 배율 %i, %i×%i', (scale, dpr, pixelScale, width, height) => {
    expect(cellSize(scale, dpr)).toEqual({ pixelScale, width, height })
  })

  it('정수가 아닌 dpr은 scale × dpr을 반올림한 정수 배율', () => {
    expect(pixelScaleFor(2, 1.5)).toBe(3)
    expect(pixelScaleFor(1, 1.25)).toBe(1)
    expect(pixelScaleFor(3, 1.5)).toBe(5)
    expect(pixelScaleFor(1, 1.75)).toBe(2)
  })

  it('비정상 dpr은 1로 보고, 배율은 최소 1', () => {
    expect(pixelScaleFor(2, 0)).toBe(2)
    expect(pixelScaleFor(2, Number.NaN)).toBe(2)
    expect(pixelScaleFor(1, 0.25)).toBe(1)
  })
})

describe('paintSprite', () => {
  const grid = composeGrid('stand', 'pair', 'idle')
  const opaqueCount = grid.join('').split('').filter((ch) => colorOf(ch)).length

  it.each([1, 2, 4, 6])('픽셀 배율 %i: 정수 좌표 fillRect, 크기 = 배율(1.02 아님)', (p) => {
    const { sink, calls } = recordingSink()
    paintSprite(sink, grid, p, 10, 20)
    expect(calls).toHaveLength(opaqueCount)
    for (const call of calls) {
      expect(Number.isInteger(call.x)).toBe(true)
      expect(Number.isInteger(call.y)).toBe(true)
      expect(call.w).toBe(p)
      expect(call.h).toBe(p)
      // 셀 원점 + 패딩 오프셋 위에 스프라이트 격자로 정렬
      expect((call.x - 10) % p).toBe(0)
      expect((call.y - 20) % p).toBe(0)
      const sx = (call.x - 10) / p - PAD_X
      const sy = (call.y - 20) / p - PAD_Y
      expect(call.color).toBe(PAL[grid[sy][sx] as PalKey])
    }
  })

  it('팔레트 밖 색을 쓰지 않는다', () => {
    const { sink, calls } = recordingSink()
    paintSprite(sink, composeGrid('squash', 'bud', 'sleepy'), 3)
    const allowed = new Set<string>(Object.values(PAL).filter((c): c is NonNullable<typeof c> => c !== null))
    for (const call of calls) expect(allowed.has(call.color)).toBe(true)
  })
})
