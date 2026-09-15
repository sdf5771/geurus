import { EXPR, type ExprKey } from './expr'
import { applyLeaf, type LeafKey } from './leaf'
import { SPRITE_H, SPRITE_W, type Grid, type Patch } from './palette'
import { POSE, type PoseKey } from './pose'

/**
 * EXPR 패치를 그리드에 덮는다. 원본 렌더(`rects`/`spriteRects`)와 같이 좌표 고정, 오프셋 없음.
 * 원본은 16×18 루프 안에서만 패치를 읽으므로 경계 밖 키는 무시된다.
 */
export function applyExpr(grid: Grid, patch: Patch): string[] {
  const out = grid.map((row) => row.split(''))
  for (const key of Object.keys(patch)) {
    const [r, c] = key.split(',').map(Number)
    if (r < 0 || r > SPRITE_H - 1 || c < 0 || c > SPRITE_W - 1) continue
    out[r][c] = patch[key]
  }
  return out.map((cells) => cells.join(''))
}

/**
 * 16×18 합성 그리드를 만든다. 순서: `POSE → LEAF(leafCoord 변환 후) → EXPR`.
 * (`fx`는 2·3단계 몫 — 1단계에는 없다)
 */
export function composeGrid(pose: PoseKey, leaf: LeafKey, expr: ExprKey): string[] {
  return applyExpr(applyLeaf(POSE[pose], pose, leaf), EXPR[expr])
}
