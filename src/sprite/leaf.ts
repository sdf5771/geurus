import { SPRITE_H, SPRITE_W, type Grid, type Patch } from './palette'
import type { PoseKey } from './pose'

/**
 * LEAF 스파스 패치 레이어 — 원본 `docs/design/finishing-set.html`의
 * `LEAF`·`LEAF_OFFSET`·`leafCoord`·`applyLeaf`·`leafFor`. 이식만 하고 재설계하지 않는다.
 *
 * EXPR이 행 8~11(눈·입)을 덮듯 LEAF는 행 1~3(잎)을 덮는다.
 * stand 기준 좌표 하나만 유지하고 포즈 차이는 LEAF_OFFSET으로 보정한다.
 * `.` = 지우기, `L`/`l` = 잎 픽셀.
 */
export const LEAF = {
  pair: {},
  triple: { '1,5': '.', '1,10': '.', '2,6': '.', '2,9': '.', '2,8': 'L', '3,7': 'L', '3,8': 'l' },
  stem: {
    '1,4': '.', '1,5': '.', '1,10': '.', '1,11': '.',
    '2,3': '.', '2,4': '.', '2,5': '.', '2,6': '.', '2,9': '.', '2,10': '.', '2,11': '.', '2,12': '.',
    '3,4': '.', '3,5': '.', '3,6': '.', '3,7': '.', '3,8': '.', '3,9': '.', '3,10': '.', '3,11': '.',
  },
  bud: {
    '1,4': '.', '1,5': '.', '1,10': '.', '1,11': '.', '1,7': 'L', '1,8': 'L',
    '2,3': '.', '2,4': '.', '2,5': '.', '2,11': '.', '2,12': '.',
    '2,6': 'L', '2,7': 'l', '2,8': 'l', '2,9': 'L',
    '3,4': '.', '3,5': '.', '3,10': '.', '3,11': '.', '3,7': 'L', '3,8': 'L',
  },
} as const satisfies Record<string, Patch>

export type LeafKey = keyof typeof LEAF

export const LEAF_KEYS = ['pair', 'triple', 'stem', 'bud'] as const satisfies readonly LeafKey[]

/** 포즈별 보정 — dr 수직 · dc 수평 · spread 좌우 벌림(중심 7.5 기준) */
export interface LeafOffset {
  readonly dr: number
  readonly dc: number
  readonly spread: number
}

export const LEAF_OFFSET = {
  stand: { dr: 0, dc: 0, spread: 0 },
  squash: { dr: 1, dc: 0, spread: 2 },
  stretch: { dr: -1, dc: 0, spread: -1 },
  lean: { dr: 0, dc: 1, spread: 0 },
} as const satisfies Record<PoseKey, LeafOffset>

/** 중심선(7.5) 왼쪽 픽셀은 더 왼쪽으로, 오른쪽 픽셀은 더 오른쪽으로 민다 */
export function leafCoord(r: number, c: number, off: LeafOffset): [number, number] {
  const side = c < 7.5 ? -1 : 1
  return [r + off.dr, c + off.dc + side * off.spread]
}

/**
 * 패치를 오프셋 변환 후 그리드에 덮는다. 16×18 경계 밖으로 나간 좌표는 무시한다.
 * `applyLeaf`의 본체 — 경계 처리를 임의 패치로 검증할 수 있게 분리했다.
 */
export function applyLeafPatch(grid: Grid, patch: Patch, off: LeafOffset): string[] {
  const out = grid.map((row) => row.split(''))
  for (const key of Object.keys(patch)) {
    const [r0, c0] = key.split(',').map(Number)
    const [r, c] = leafCoord(r0, c0, off)
    if (r < 0 || r > SPRITE_H - 1 || c < 0 || c > SPRITE_W - 1) continue
    out[r][c] = patch[key]
  }
  return out.map((cells) => cells.join(''))
}

export function applyLeaf(grid: Grid, poseKey: PoseKey, leafKey: LeafKey): string[] {
  const patch: Patch | undefined = LEAF[leafKey]
  if (!patch) return [...grid]
  const off = LEAF_OFFSET[poseKey] ?? LEAF_OFFSET.stand
  return applyLeafPatch(grid, patch, off)
}

/** 16px 미만 미니 버전은 잎 변주 생략 — 판독이 안 되고 녹색 망이 부서진다 */
export function leafFor(scale: number, leafKey: LeafKey): LeafKey {
  return scale < 1 ? 'pair' : leafKey
}
