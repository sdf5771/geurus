import { ANCHOR_X, ANCHOR_Y, CELL_H, PAD_X, PAD_Y } from '../sprite/raster'

/** 기기 픽셀 좌표 (정수) */
export interface DevicePoint {
  readonly x: number
  readonly y: number
}

/** 앵커(발밑, 스프라이트 (8,16))가 `anchor`에 오도록 하는 셀 원점 */
export function cellOriginForAnchor(anchor: DevicePoint, pixelScale: number): DevicePoint {
  return {
    x: anchor.x - (PAD_X + ANCHOR_X) * pixelScale,
    y: anchor.y - (PAD_Y + ANCHOR_Y) * pixelScale,
  }
}

/**
 * 1단계 정지 렌더의 앵커 위치 — 가로 중앙, 세로는 패딩 포함 셀 바닥이 캔버스 바닥에 닿는 높이.
 * (정원 레이아웃은 4단계 몫이라 여기서는 셀이 잘리지 않는 가장 낮은 위치만 정한다)
 */
export function stageAnchor(canvasWidth: number, canvasHeight: number, pixelScale: number): DevicePoint {
  const belowAnchor = CELL_H - (PAD_Y + ANCHOR_Y)
  return {
    x: Math.floor(canvasWidth / 2),
    y: canvasHeight - belowAnchor * pixelScale,
  }
}
