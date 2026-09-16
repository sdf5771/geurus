import { composeGrid } from './compose'
import { EXPR_KEYS, type ExprKey } from './expr'
import { LEAF_KEYS, type LeafKey } from './leaf'
import { POSE_KEYS, type PoseKey } from './pose'
import { SPRITE_SCALES, cellSize, paintSprite, type PixelSink, type SpriteScale } from './raster'

/**
 * 부팅 시 한 번 굽는 스프라이트 아틀라스. 배율마다 캔버스 1장.
 * 행 = 포즈(4), 열 = 잎(4) × 표정(7) → 배율당 112셀, 3배율 합계 336셀.
 * 이후 화면에는 `drawSprite`로 1:1 blit만 한다.
 */
export const ATLAS_COLS = LEAF_KEYS.length * EXPR_KEYS.length
export const ATLAS_ROWS = POSE_KEYS.length
export const ATLAS_CELLS_PER_SCALE = ATLAS_COLS * ATLAS_ROWS

export interface AtlasSlot {
  readonly col: number
  readonly row: number
}

export function atlasSlot(pose: PoseKey, leaf: LeafKey, expr: ExprKey): AtlasSlot {
  return {
    row: POSE_KEYS.indexOf(pose),
    col: LEAF_KEYS.indexOf(leaf) * EXPR_KEYS.length + EXPR_KEYS.indexOf(expr),
  }
}

export interface Atlas {
  readonly scale: SpriteScale
  readonly pixelScale: number
  readonly cellWidth: number
  readonly cellHeight: number
  readonly source: CanvasImageSource
}

/** 굽기 대상 표면. 테스트에서는 가짜 ctx를 주입한다 */
export interface BakeSurface {
  readonly ctx: PixelSink
  readonly source: CanvasImageSource
}

export type SurfaceFactory = (width: number, height: number) => BakeSurface

export function bakeAtlas(scale: SpriteScale, dpr: number, createSurface: SurfaceFactory): Atlas {
  const { pixelScale, width, height } = cellSize(scale, dpr)
  const surface = createSurface(width * ATLAS_COLS, height * ATLAS_ROWS)
  for (const pose of POSE_KEYS) {
    for (const leaf of LEAF_KEYS) {
      for (const expr of EXPR_KEYS) {
        const { col, row } = atlasSlot(pose, leaf, expr)
        paintSprite(surface.ctx, composeGrid(pose, leaf, expr), pixelScale, col * width, row * height)
      }
    }
  }
  return { scale, pixelScale, cellWidth: width, cellHeight: height, source: surface.source }
}

/** 브라우저(렌더러)용 표면. OffscreenCanvas가 있으면 쓰고, 없으면 분리된 `<canvas>` */
export function createCanvasSurface(width: number, height: number): BakeSurface {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('OffscreenCanvas 2d context unavailable')
    ctx.imageSmoothingEnabled = false
    return { ctx, source: canvas }
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context unavailable')
  ctx.imageSmoothingEnabled = false
  return { ctx, source: canvas }
}

export type AtlasSet = ReadonlyMap<SpriteScale, Atlas>

export function bakeAllAtlases(
  dpr: number,
  createSurface: SurfaceFactory = createCanvasSurface,
): AtlasSet {
  return new Map(SPRITE_SCALES.map((scale) => [scale, bakeAtlas(scale, dpr, createSurface)]))
}

/** 화면 캔버스에 셀 하나를 1:1로 blit한다. 확대하지 않는다 (source 크기 = dest 크기) */
export type BlitTarget = Pick<CanvasDrawImage, 'drawImage'>

export function drawSprite(
  ctx: BlitTarget,
  atlas: Atlas,
  pose: PoseKey,
  leaf: LeafKey,
  expr: ExprKey,
  cellX: number,
  cellY: number,
): void {
  const { col, row } = atlasSlot(pose, leaf, expr)
  const w = atlas.cellWidth
  const h = atlas.cellHeight
  ctx.drawImage(atlas.source, col * w, row * h, w, h, cellX, cellY, w, h)
}
