import { describe, expect, it, vi } from 'vitest'
import {
  ATLAS_CELLS_PER_SCALE,
  ATLAS_COLS,
  ATLAS_ROWS,
  atlasSlot,
  bakeAllAtlases,
  drawSprite,
  type BakeSurface,
} from './atlas'
import { EXPR_KEYS } from './expr'
import { LEAF_KEYS } from './leaf'
import { POSE_KEYS } from './pose'

function fakeSurfaceFactory() {
  const surfaces: { width: number; height: number; rects: number[][] }[] = []
  const factory = (width: number, height: number): BakeSurface => {
    const record = { width, height, rects: [] as number[][] }
    surfaces.push(record)
    return {
      ctx: {
        fillStyle: '',
        fillRect: (x: number, y: number, w: number, h: number) => record.rects.push([x, y, w, h]),
      },
      source: {} as CanvasImageSource,
    }
  }
  return { factory, surfaces }
}

describe('아틀라스 레이아웃', () => {
  it('포즈 4 × 잎 4 × 표정 7 = 배율당 112셀, 슬롯이 겹치지 않는다', () => {
    expect(ATLAS_CELLS_PER_SCALE).toBe(112)
    const slots = new Set<string>()
    for (const pose of POSE_KEYS) {
      for (const leaf of LEAF_KEYS) {
        for (const expr of EXPR_KEYS) {
          const { col, row } = atlasSlot(pose, leaf, expr)
          expect(col).toBeGreaterThanOrEqual(0)
          expect(col).toBeLessThan(ATLAS_COLS)
          expect(row).toBeGreaterThanOrEqual(0)
          expect(row).toBeLessThan(ATLAS_ROWS)
          slots.add(`${col},${row}`)
        }
      }
    }
    expect(slots.size).toBe(112)
  })
})

describe('bakeAllAtlases', () => {
  it('dpr 2: ×1·×2·×3을 픽셀 배율 2·4·6으로 굽고, 합계 336셀', () => {
    const { factory, surfaces } = fakeSurfaceFactory()
    const atlases = bakeAllAtlases(2, factory)
    expect([...atlases.keys()]).toEqual([1, 2, 3])
    expect([...atlases.values()].map((a) => a.pixelScale)).toEqual([2, 4, 6])
    expect(atlases.size * ATLAS_CELLS_PER_SCALE).toBe(336)

    const x2 = atlases.get(2)!
    expect([x2.cellWidth, x2.cellHeight]).toEqual([104, 128])
    expect(surfaces[1]).toMatchObject({ width: 104 * ATLAS_COLS, height: 128 * ATLAS_ROWS })

    for (const [index, surface] of surfaces.entries()) {
      const p = [2, 4, 6][index]
      expect(surface.rects.length).toBeGreaterThan(0)
      for (const [x, y, w, h] of surface.rects) {
        expect([w, h]).toEqual([p, p])
        expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true)
        expect(x + w).toBeLessThanOrEqual(surface.width)
        expect(y + h).toBeLessThanOrEqual(surface.height)
      }
    }
  })
})

describe('drawSprite', () => {
  it('source 크기 = dest 크기 (1:1 blit, 확대 없음)', () => {
    const { factory } = fakeSurfaceFactory()
    const atlas = bakeAllAtlases(2, factory).get(2)!
    const drawImage = vi.fn()
    drawSprite({ drawImage } as unknown as Pick<CanvasDrawImage, 'drawImage'>, atlas, 'lean', 'bud', 'think', 308, 352)
    expect(drawImage).toHaveBeenCalledTimes(1)
    const [source, sx, sy, sw, sh, dx, dy, dw, dh] = drawImage.mock.calls[0]
    const { col, row } = atlasSlot('lean', 'bud', 'think')
    expect(source).toBe(atlas.source)
    expect([sx, sy]).toEqual([col * 104, row * 128])
    expect([sw, sh]).toEqual([104, 128])
    expect([dx, dy]).toEqual([308, 352])
    expect([dw, dh]).toEqual([sw, sh])
  })
})
