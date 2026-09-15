import { describe, expect, it } from 'vitest'
import { applyExpr, composeGrid } from './compose'
import { EXPR, EXPR_KEYS } from './expr'
import { LEAF, LEAF_KEYS, LEAF_OFFSET, applyLeaf, leafCoord } from './leaf'
import { SPRITE_H, SPRITE_W } from './palette'
import { POSE, POSE_KEYS } from './pose'

const ALL_COMBOS = POSE_KEYS.flatMap((pose) =>
  LEAF_KEYS.flatMap((leaf) => EXPR_KEYS.map((expr) => [pose, leaf, expr] as const)),
)

describe('composeGrid', () => {
  it('stand + pair + idle은 원본 stand 그대로', () => {
    expect(composeGrid('stand', 'pair', 'idle')).toEqual(POSE.stand)
  })

  it('112조합 모두 16×18', () => {
    for (const [pose, leaf, expr] of ALL_COMBOS) {
      const grid = composeGrid(pose, leaf, expr)
      expect(grid).toHaveLength(SPRITE_H)
      for (const row of grid) expect(row).toHaveLength(SPRITE_W)
    }
  })

  it('순서 POSE → LEAF → EXPR: EXPR 좌표는 EXPR 값, LEAF 좌표는 LEAF 값', () => {
    for (const [pose, leaf, expr] of ALL_COMBOS) {
      const grid = composeGrid(pose, leaf, expr)
      const exprPatch: Record<string, string> = EXPR[expr]
      for (const [coord, value] of Object.entries(exprPatch)) {
        const [r, c] = coord.split(',').map(Number)
        expect(grid[r][c]).toBe(value)
      }
      // stretch(spread −1)에서는 원본 패치 두 키가 같은 칸으로 모일 수 있다 → 원본처럼 나중 키가 이긴다
      const leafCells = new Map<string, string>()
      for (const [coord, value] of Object.entries(LEAF[leaf])) {
        const [r0, c0] = coord.split(',').map(Number)
        const [r, c] = leafCoord(r0, c0, LEAF_OFFSET[pose])
        if (r < 0 || r >= SPRITE_H || c < 0 || c >= SPRITE_W) continue
        leafCells.set(`${r},${c}`, value)
      }
      for (const [coord, value] of leafCells) {
        const [r, c] = coord.split(',').map(Number)
        expect(grid[r][c]).toBe(value)
      }
    }
  })

  it('LEAF 패치(행 1~3 + 포즈 보정)와 EXPR 눈·입 패치(행 8~11)는 서로 덮지 않는다', () => {
    for (const [pose, leaf, expr] of ALL_COMBOS) {
      const leafCells = new Set(
        Object.keys(LEAF[leaf]).map((coord) => {
          const [r0, c0] = coord.split(',').map(Number)
          const [r, c] = leafCoord(r0, c0, LEAF_OFFSET[pose])
          expect(r0).toBeGreaterThanOrEqual(1)
          expect(r0).toBeLessThanOrEqual(3)
          return `${r},${c}`
        }),
      )
      for (const coord of Object.keys(EXPR[expr])) {
        expect(leafCells.has(coord)).toBe(false)
      }
      // 겹치지 않으므로 LEAF와 EXPR의 적용 순서를 바꿔도 결과가 같다
      const exprFirst = applyLeaf(applyExpr(POSE[pose], EXPR[expr]), pose, leaf)
      expect(composeGrid(pose, leaf, expr)).toEqual(exprFirst)
    }
  })

  it('눈·입 패치 좌표는 행 8~11 (sleepy zzz 5,13·4,14만 예외)', () => {
    for (const key of EXPR_KEYS) {
      for (const [coord, value] of Object.entries(EXPR[key])) {
        if (value === 'z') continue
        const [r] = coord.split(',').map(Number)
        expect(r).toBeGreaterThanOrEqual(8)
        expect(r).toBeLessThanOrEqual(11)
      }
    }
  })
})
