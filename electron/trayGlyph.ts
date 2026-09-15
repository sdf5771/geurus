/**
 * 트레이 템플릿 글리프 데이터와 비트맵 변환 (순수 로직, Electron 비의존).
 * 원본: docs/design/Geurus 마감 세트.html `TRAY_GLYPH.sprout` — 그대로 이식, 수정 금지.
 * `#` = 검정 불투명, `.` = 투명. macOS 템플릿 이미지이므로 색을 쓰지 않는다.
 */

export const TRAY_GLYPH_SIZE = 16

export const TRAY_GLYPH_SPROUT: readonly string[] = [
  '................',
  '................',
  '................',
  '....##....##....',
  '...####..####...',
  '....####.###....',
  '.....#.##.#.....',
  '......####......',
  '.......##.......',
  '.......##.......',
  '.......##.......',
  '......####......',
  '.....######.....',
  '................',
  '................',
  '................',
]

export interface GlyphBitmap {
  width: number
  height: number
  /** BGRA 8bit, 행 우선. 검정+알파만 쓰므로 premultiplied/straight 결과가 같다. */
  data: Uint8Array
}

/**
 * 문자열 그리드를 정수 배율(scale)로 확대한 BGRA 비트맵으로 변환한다.
 * 각 글리프 픽셀을 scale×scale 블록으로 복제한다(보간 없음).
 */
export function glyphToBitmap(grid: readonly string[], scale: number): GlyphBitmap {
  if (!Number.isInteger(scale) || scale < 1) {
    throw new RangeError(`scale must be a positive integer: ${scale}`)
  }
  const rows = grid.length
  const cols = rows > 0 ? grid[0].length : 0
  for (const row of grid) {
    if (row.length !== cols) throw new Error('glyph rows must have equal length')
    if (!/^[#.]*$/.test(row)) throw new Error(`glyph row has invalid characters: ${row}`)
  }

  const width = cols * scale
  const height = rows * scale
  const data = new Uint8Array(width * height * 4) // 0으로 초기화 = 완전 투명

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '#') continue
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const i = ((r * scale + dy) * width + (c * scale + dx)) * 4
          // B, G, R = 0 (검정), A = 255
          data[i + 3] = 255
        }
      }
    }
  }

  return { width, height, data }
}
