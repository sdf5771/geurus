import { SPRITE_H, SPRITE_W, colorOf, type Grid } from './palette'

/**
 * 래스터 셀 좌표계 — 원본 `docs/design/motion-system.html`의 `PAD_X/PAD_Y`·앵커.
 * 1단계에는 fx가 없지만 2·3단계(fx가 16×18 밖으로 나감)와 좌표계를 맞추려고 패딩 포함 셀로 굽는다.
 */
export const PAD_X = 5
export const PAD_Y = 7
/** 패딩 포함 셀 크기(스프라이트 픽셀) = 26 × 32 */
export const CELL_W = SPRITE_W + PAD_X * 2
export const CELL_H = SPRITE_H + PAD_Y * 2
/** 앵커 — 16×18 스프라이트 기준 하단 중앙(발밑) */
export const ANCHOR_X = 8
export const ANCHOR_Y = 16

/** 굽는 표시 배율. 정수배만 */
export const SPRITE_SCALES = [1, 2, 3] as const
export type SpriteScale = (typeof SPRITE_SCALES)[number]

/**
 * 스프라이트 픽셀 1개가 차지하는 기기 픽셀 수(정수).
 * dpr이 정수면 `scale × dpr` 그대로. 정수가 아니면(예: 1.5) 반올림해 정수로 맞춘다 —
 * 표시 크기가 CSS 기준 목표에서 최대 0.5 기기 픽셀/스프라이트 픽셀 어긋나지만 보간은 생기지 않는다.
 */
export function pixelScaleFor(scale: number, dpr: number): number {
  const safeDpr = Number.isFinite(dpr) && dpr > 0 ? dpr : 1
  return Math.max(1, Math.round(scale * safeDpr))
}

export interface CellSize {
  /** 스프라이트 픽셀당 기기 픽셀 */
  readonly pixelScale: number
  /** 패딩 포함 셀 너비(기기 픽셀) */
  readonly width: number
  /** 패딩 포함 셀 높이(기기 픽셀) */
  readonly height: number
}

export function cellSize(scale: number, dpr: number): CellSize {
  const pixelScale = pixelScaleFor(scale, dpr)
  return { pixelScale, width: CELL_W * pixelScale, height: CELL_H * pixelScale }
}

/** 픽셀을 찍는 데 필요한 2D 컨텍스트의 최소 부분 (CanvasRenderingContext2D·OffscreenCanvasRenderingContext2D 공통) */
export type PixelSink = Pick<CanvasFillStrokeStyles, 'fillStyle'> & Pick<CanvasRect, 'fillRect'>

/**
 * 합성 그리드 하나를 셀 원점 (originX, originY)에 굽는다. 스프라이트는 셀의 (PAD_X, PAD_Y)에 놓인다.
 * 픽셀은 정수 좌표 `fillRect` — 원본 SVG의 `width="1.02"`는 버리고 정확히 1(×pixelScale)을 쓴다.
 */
export function paintSprite(
  ctx: PixelSink,
  grid: Grid,
  pixelScale: number,
  originX = 0,
  originY = 0,
): void {
  for (let y = 0; y < SPRITE_H; y++) {
    const row = grid[y] ?? ''
    for (let x = 0; x < SPRITE_W; x++) {
      const color = colorOf(row[x] ?? '.')
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(
        originX + (PAD_X + x) * pixelScale,
        originY + (PAD_Y + y) * pixelScale,
        pixelScale,
        pixelScale,
      )
    }
  }
}
