/**
 * 그루 팔레트 — 원본 `docs/design/finishing-set.html`·`motion-system.html`의 `PAL`(두 파일 동일).
 * 12색 + 투명(`.`). 팔레트 밖 색은 추가하지 않는다. 골드 `G`·새싹 그린 `L`은 변경 금지.
 */
export const PAL = {
  '.': null,
  G: '#e6a536',
  D: '#c98a22',
  H: '#ffd770',
  L: '#6fcf7c',
  l: '#3f9550',
  E: '#10182b',
  W: '#f4ecd2',
  k: '#ff9b6b',
  b: '#8a5a1e',
  m: '#7a4412',
  s: '#5fb8e6',
  z: '#9fb0d8',
} as const

/** 그리드 문자 하나. `.`은 투명 */
export type PalKey = keyof typeof PAL

/** 16×18 문자 그리드. 행 문자열 18개, 각 16자 */
export type Grid = readonly string[]

/** `"행,열"` → 팔레트 키. LEAF·EXPR이 쓰는 스파스 패치 */
export type Patch = Readonly<Record<string, PalKey>>

export const SPRITE_W = 16
export const SPRITE_H = 18

export function isPalKey(ch: string): ch is PalKey {
  return Object.prototype.hasOwnProperty.call(PAL, ch)
}

/** 불투명 픽셀이면 색, 투명이거나 팔레트 밖이면 null */
export function colorOf(ch: string): string | null {
  return isPalKey(ch) ? PAL[ch] : null
}
