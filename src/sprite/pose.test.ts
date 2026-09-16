import { describe, expect, it } from 'vitest'
import { EXPR, EXPR_KEYS } from './expr'
import { PAL, SPRITE_H, SPRITE_W, isPalKey } from './palette'
import { POSE, POSE_KEYS } from './pose'

describe('PAL', () => {
  it('투명(.) + 12색, 브랜드 고정색 유지', () => {
    expect(Object.keys(PAL)).toHaveLength(13)
    expect(PAL['.']).toBeNull()
    expect(PAL.G).toBe('#e6a536')
    expect(PAL.L).toBe('#6fcf7c')
  })
})

describe('POSE', () => {
  it('4종 — stand·squash·stretch·lean', () => {
    expect(Object.keys(POSE).sort()).toEqual([...POSE_KEYS].sort())
  })

  it.each(POSE_KEYS)('%s: 16×18이고 PAL 키만 사용', (key) => {
    const grid = POSE[key]
    expect(grid).toHaveLength(SPRITE_H)
    for (const row of grid) {
      expect(row).toHaveLength(SPRITE_W)
      for (const ch of row) expect(isPalKey(ch)).toBe(true)
    }
  })

  it('EXPR이 덮는 눈·입 좌표(행 8~11)는 4종 모두 동일 — EXPR 패치 전제', () => {
    for (const key of POSE_KEYS) {
      for (const expr of EXPR_KEYS) {
        for (const coord of Object.keys(EXPR[expr])) {
          const [r, c] = coord.split(',').map(Number)
          if (r < 8 || r > 11) continue
          expect(POSE[key][r][c]).toBe(POSE.stand[r][c])
        }
      }
    }
  })
})
