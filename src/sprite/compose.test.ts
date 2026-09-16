import { describe, expect, it } from 'vitest'
import { COMPOSE_ORIGINAL } from './__fixtures__/sprite.original'
import { composeGrid, composeLayers } from './compose'
import { EXPR_KEYS } from './expr'
import { LEAF_KEYS } from './leaf'
import { SPRITE_H, SPRITE_W } from './palette'
import { POSE, POSE_KEYS } from './pose'

const ALL_COMBOS = POSE_KEYS.flatMap((pose) =>
  LEAF_KEYS.flatMap((leaf) => EXPR_KEYS.map((expr) => [pose, leaf, expr] as const)),
)

const BLANK: readonly string[] = Array.from({ length: SPRITE_H }, () => '.'.repeat(SPRITE_W))
const NO_OFFSET = { dr: 0, dc: 0, spread: 0 }

function cell(grid: readonly string[], r: number, c: number): string {
  return grid[r][c]
}

describe('composeLayers — 합성 순서 POSE → LEAF → EXPR', () => {
  it('LEAF와 EXPR이 같은 칸을 덮으면 EXPR이 이긴다', () => {
    const pose = BLANK.map((row, r) => (r === 5 ? 'G'.repeat(SPRITE_W) : row))
    const out = composeLayers(pose, { '5,4': 'L' }, NO_OFFSET, { '5,4': 'E' })
    expect(cell(out, 5, 4)).toBe('E')
  })

  it('LEAF는 POSE를 덮는다 (EXPR이 없는 칸)', () => {
    const pose = BLANK.map((row, r) => (r === 5 ? 'G'.repeat(SPRITE_W) : row))
    const out = composeLayers(pose, { '5,4': 'L', '5,11': 'l' }, NO_OFFSET, { '5,4': 'E' })
    expect(cell(out, 5, 11)).toBe('l')
    expect(cell(out, 5, 0)).toBe('G')
  })

  it('LEAF는 leafCoord 변환 뒤 좌표에서 EXPR과 겹치고, 그 칸도 EXPR이 이긴다', () => {
    // '2,3' + {dr:+1, spread:+2} → 왼쪽(c<7.5)이라 (3, 1)
    const leafOffset = { dr: 1, dc: 0, spread: 2 }
    const out = composeLayers(BLANK, { '2,3': 'L' }, leafOffset, { '3,1': 'm' })
    expect(cell(out, 3, 1)).toBe('m')
    expect(cell(out, 2, 3)).toBe('.')

    const leafOnly = composeLayers(BLANK, { '2,3': 'L' }, leafOffset, {})
    expect(cell(leafOnly, 3, 1)).toBe('L')
  })

  it('EXPR의 지우기(.)도 LEAF 픽셀보다 나중에 적용된다', () => {
    const out = composeLayers(BLANK, { '8,13': 'L' }, NO_OFFSET, { '8,13': '.' })
    expect(cell(out, 8, 13)).toBe('.')
  })
})

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

  it('원본 스냅샷 112조합 전부 수록', () => {
    expect(Object.keys(COMPOSE_ORIGINAL).sort()).toEqual(
      ALL_COMBOS.map(([pose, leaf, expr]) => `${pose}/${leaf}/${expr}`).sort(),
    )
  })

  it.each(ALL_COMBOS)('%s × %s × %s — 원본 렌더 스냅샷과 일치', (pose, leaf, expr) => {
    expect(composeGrid(pose, leaf, expr)).toEqual(COMPOSE_ORIGINAL[`${pose}/${leaf}/${expr}`])
  })
})
