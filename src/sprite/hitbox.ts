import { SPRITE_H, SPRITE_W, colorOf, type Grid } from './palette'
import { PAD_X, PAD_Y } from './raster'

/**
 * 불투명 픽셀 bounding box (스프라이트 좌표, 양 끝 포함). 패딩은 포함하지 않는다.
 * 픽셀 단위가 아니라 사각형이라서 잎 사이 틈·투명 모서리 클릭도 그루가 가져간다(의도 — 경계 깜빡임 방지).
 */
export interface GridBounds {
  readonly minX: number
  readonly minY: number
  readonly maxX: number
  readonly maxY: number
}

export function opaqueBounds(grid: Grid): GridBounds | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let y = 0; y < SPRITE_H; y++) {
    const row = grid[y] ?? ''
    for (let x = 0; x < SPRITE_W; x++) {
      if (!colorOf(row[x] ?? '.')) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  return minX === Infinity ? null : { minX, minY, maxX, maxY }
}

/** CSS 픽셀 사각형. left·top 포함, right·bottom 제외(반열림) */
export interface Rect {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

/**
 * 그리드 bounding box를 화면 CSS 좌표 사각형으로 환산한다.
 * @param cellX 셀 원점(기기 픽셀)
 * @param cellY 셀 원점(기기 픽셀)
 * @param pixelScale 스프라이트 픽셀당 기기 픽셀
 * @param dpr 기기 픽셀 → CSS 픽셀 환산
 */
export function boundsToCssRect(
  bounds: GridBounds,
  cellX: number,
  cellY: number,
  pixelScale: number,
  dpr: number,
): Rect {
  const toCss = (device: number) => device / dpr
  return {
    left: toCss(cellX + (PAD_X + bounds.minX) * pixelScale),
    top: toCss(cellY + (PAD_Y + bounds.minY) * pixelScale),
    right: toCss(cellX + (PAD_X + bounds.maxX + 1) * pixelScale),
    bottom: toCss(cellY + (PAD_Y + bounds.maxY + 1) * pixelScale),
  }
}

export function isInsideRect(rect: Rect | null, x: number, y: number): boolean {
  if (!rect) return false
  return x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom
}
