import { describe, expect, it } from 'vitest'
import { TRAY_GLYPH_SIZE, TRAY_GLYPH_SPROUT, glyphToBitmap } from './trayGlyph'

const alphaAt = (bmp: { width: number; data: Uint8Array }, x: number, y: number) =>
  bmp.data[(y * bmp.width + x) * 4 + 3]

describe('TRAY_GLYPH_SPROUT', () => {
  it('16×16이고 # 과 . 만 쓴다', () => {
    expect(TRAY_GLYPH_SPROUT).toHaveLength(TRAY_GLYPH_SIZE)
    for (const row of TRAY_GLYPH_SPROUT) {
      expect(row).toHaveLength(TRAY_GLYPH_SIZE)
      expect(row).toMatch(/^[#.]+$/)
    }
  })
})

describe('glyphToBitmap', () => {
  it('1x: 16×16 BGRA, # 은 검정 불투명 / . 은 완전 투명', () => {
    const bmp = glyphToBitmap(TRAY_GLYPH_SPROUT, 1)
    expect(bmp.width).toBe(16)
    expect(bmp.height).toBe(16)
    expect(bmp.data.length).toBe(16 * 16 * 4)

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4
        // 템플릿 이미지: 색 채널은 항상 0
        expect([bmp.data[i], bmp.data[i + 1], bmp.data[i + 2]]).toEqual([0, 0, 0])
        expect(bmp.data[i + 3]).toBe(TRAY_GLYPH_SPROUT[y][x] === '#' ? 255 : 0)
      }
    }
  })

  it('알파는 0 또는 255 뿐이다 (반투명 보간 없음)', () => {
    for (const scale of [1, 2]) {
      const bmp = glyphToBitmap(TRAY_GLYPH_SPROUT, scale)
      const alphas = new Set<number>()
      for (let i = 3; i < bmp.data.length; i += 4) alphas.add(bmp.data[i])
      expect([...alphas].sort((a, b) => a - b)).toEqual([0, 255])
    }
  })

  it('2x: 32×32, 각 글리프 픽셀이 2×2 블록으로 정수 확대된다', () => {
    const x1 = glyphToBitmap(TRAY_GLYPH_SPROUT, 1)
    const x2 = glyphToBitmap(TRAY_GLYPH_SPROUT, 2)
    expect(x2.width).toBe(32)
    expect(x2.height).toBe(32)
    expect(x2.data.length).toBe(32 * 32 * 4)

    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const i = (y * 32 + x) * 4
        expect([x2.data[i], x2.data[i + 1], x2.data[i + 2]]).toEqual([0, 0, 0])
        expect(alphaAt(x2, x, y)).toBe(alphaAt(x1, Math.floor(x / 2), Math.floor(y / 2)))
      }
    }
  })

  it('불투명 픽셀 수는 배율의 제곱에 비례한다', () => {
    const count = (s: number) => {
      const bmp = glyphToBitmap(TRAY_GLYPH_SPROUT, s)
      let n = 0
      for (let i = 3; i < bmp.data.length; i += 4) if (bmp.data[i] === 255) n++
      return n
    }
    const inked = TRAY_GLYPH_SPROUT.join('').split('').filter((ch) => ch === '#').length
    expect(count(1)).toBe(inked)
    expect(count(2)).toBe(inked * 4)
  })

  it('정수가 아니거나 1 미만인 배율은 거부한다', () => {
    expect(() => glyphToBitmap(TRAY_GLYPH_SPROUT, 1.5)).toThrow(RangeError)
    expect(() => glyphToBitmap(TRAY_GLYPH_SPROUT, 0)).toThrow(RangeError)
  })

  it('잘못된 그리드는 거부한다', () => {
    expect(() => glyphToBitmap(['##', '#'], 1)).toThrow()
    expect(() => glyphToBitmap(['#x'], 1)).toThrow()
  })
})
