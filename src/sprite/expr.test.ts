import { describe, expect, it } from 'vitest'
import { EXPR, EXPR_KEYS } from './expr'
import { SPRITE_H, SPRITE_W, isPalKey } from './palette'

describe('EXPR', () => {
  it('7키 — idle·blink·happy·think·merge·conflict·sleepy', () => {
    expect(Object.keys(EXPR).sort()).toEqual(
      ['idle', 'blink', 'happy', 'think', 'merge', 'conflict', 'sleepy'].sort(),
    )
    expect([...EXPR_KEYS].sort()).toEqual(Object.keys(EXPR).sort())
  })

  it('think에는 값이 z인 키가 없다 (옛 버전 8,13·7,13 미이식)', () => {
    const think: Record<string, string> = EXPR.think
    const zKeys = Object.entries(think).filter(([, v]) => v === 'z')
    expect(zKeys).toEqual([])
    expect(EXPR.think).not.toHaveProperty(['8,13'])
    expect(EXPR.think).not.toHaveProperty(['7,13'])
  })

  it('sleepy에는 5,13과 4,14가 z로 있다', () => {
    const sleepy: Record<string, string> = EXPR.sleepy
    expect(sleepy['5,13']).toBe('z')
    expect(sleepy['4,14']).toBe('z')
  })

  it('zzz(z)는 sleepy 전용', () => {
    for (const key of EXPR_KEYS) {
      if (key === 'sleepy') continue
      expect(Object.values(EXPR[key])).not.toContain('z')
    }
  })

  it('모든 패치 값은 PAL 키, 좌표는 16×18 안', () => {
    for (const key of EXPR_KEYS) {
      for (const [coord, value] of Object.entries(EXPR[key])) {
        expect(isPalKey(value)).toBe(true)
        const [r, c] = coord.split(',').map(Number)
        expect(r).toBeGreaterThanOrEqual(0)
        expect(r).toBeLessThan(SPRITE_H)
        expect(c).toBeGreaterThanOrEqual(0)
        expect(c).toBeLessThan(SPRITE_W)
      }
    }
  })
})
