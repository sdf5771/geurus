/**
 * 오버레이 초기 위치 계산 (순수 로직).
 * 임시 정책: 주 디스플레이 workArea 우하단 + 여백. 멀티모니터 정책은 미정이라 확장하지 않는다.
 */

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export const OVERLAY_SIZE = { width: 360, height: 240 } as const
export const OVERLAY_MARGIN = 16

export function bottomRightPosition(
  workArea: Rect,
  size: { width: number; height: number },
  margin: number,
): { x: number; y: number } {
  return {
    x: Math.round(workArea.x + workArea.width - size.width - margin),
    y: Math.round(workArea.y + workArea.height - size.height - margin),
  }
}
