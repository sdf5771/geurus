import { EXPR, type ExprKey } from './expr'
import { LEAF, LEAF_OFFSET, applyLeafPatch, type LeafKey, type LeafOffset } from './leaf'
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
 * 레이어 합성 본체. 순서: `pose → leaf(leafCoord 변환 후) → expr`. 같은 칸이면 나중 레이어(EXPR)가 이긴다.
 * (`fx`는 2·3단계 몫 — 1단계에는 없다)
 */
export function composeLayers(
  pose: Grid,
  leafPatch: Patch,
  leafOffset: LeafOffset,
  exprPatch: Patch,
): string[] {
  return applyExpr(applyLeafPatch(pose, leafPatch, leafOffset), exprPatch)
}

/** 16×18 합성 그리드 */
export function composeGrid(pose: PoseKey, leaf: LeafKey, expr: ExprKey): string[] {
  return composeLayers(POSE[pose], LEAF[leaf], LEAF_OFFSET[pose], EXPR[expr])
}
