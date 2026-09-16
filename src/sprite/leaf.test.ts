import { describe, expect, it } from 'vitest'
import { APPLY_LEAF_ORIGINAL } from './__fixtures__/sprite.original'
import {
  LEAF,
  LEAF_KEYS,
  LEAF_OFFSET,
  applyLeaf,
  applyLeafPatch,
  leafCoord,
  leafFor,
} from './leaf'
import { isPalKey } from './palette'
import { POSE, POSE_KEYS } from './pose'

describe('LEAF 데이터', () => {
  it('4종 — pair·triple·stem·bud, 값은 PAL 키', () => {
    expect(Object.keys(LEAF).sort()).toEqual([...LEAF_KEYS].sort())
    for (const key of LEAF_KEYS) {
      for (const value of Object.values(LEAF[key])) expect(isPalKey(value)).toBe(true)
    }
  })

  it('LEAF_OFFSET 4포즈', () => {
    expect(Object.keys(LEAF_OFFSET).sort()).toEqual([...POSE_KEYS].sort())
  })
})

describe('leafCoord', () => {
  it('중심선 7.5 기준으로 spread 부호가 갈린다', () => {
    expect(leafCoord(2, 3, LEAF_OFFSET.squash)).toEqual([3, 1])
    expect(leafCoord(2, 12, LEAF_OFFSET.squash)).toEqual([3, 14])
    expect(leafCoord(1, 7, LEAF_OFFSET.stretch)).toEqual([0, 8])
    expect(leafCoord(1, 8, LEAF_OFFSET.stretch)).toEqual([0, 7])
    expect(leafCoord(3, 7, LEAF_OFFSET.lean)).toEqual([3, 8])
  })
})

describe('applyLeaf', () => {
  it.each(POSE_KEYS)('pair는 원본 포즈 그대로 (%s)', (pose) => {
    expect(applyLeaf(POSE[pose], pose, 'pair')).toEqual(POSE[pose])
  })

  it.each(POSE_KEYS.flatMap((pose) => LEAF_KEYS.map((leaf) => [pose, leaf] as const)))(
    '%s × %s — finishing-set.html 원본 함수 스냅샷과 일치',
    (pose, leaf) => {
      expect(applyLeaf(POSE[pose], pose, leaf)).toEqual(APPLY_LEAF_ORIGINAL[`${pose}/${leaf}`])
    },
  )

  it('입력 그리드를 변경하지 않는다', () => {
    const before = [...POSE.squash]
    applyLeaf(POSE.squash, 'squash', 'stem')
    expect(POSE.squash).toEqual(before)
  })

  it('경계 밖으로 나간 좌표는 무시한다', () => {
    const base = POSE.stand
    const up = applyLeafPatch(base, { '0,4': 'l' }, { dr: -1, dc: 0, spread: 0 })
    expect(up).toEqual(base)
    const down = applyLeafPatch(base, { '17,4': 'l' }, { dr: 1, dc: 0, spread: 0 })
    expect(down).toEqual(base)
    const left = applyLeafPatch(base, { '2,1': 'l' }, { dr: 0, dc: 0, spread: 2 })
    expect(left).toEqual(base)
    const right = applyLeafPatch(base, { '2,15': 'l' }, { dr: 0, dc: 1, spread: 0 })
    expect(right).toEqual(base)
  })

  it('경계 안 좌표는 반영되고 경계 밖은 같은 패치에서도 건너뛴다', () => {
    const out = applyLeafPatch(POSE.stand, { '0,4': 'l', '0,0': 'l' }, { dr: 0, dc: -1, spread: 0 })
    expect(out[0]).toBe('...l............')
  })
})

describe('leafFor', () => {
  it('16px 미만(scale < 1)은 pair로 폴백, 그 외는 그대로', () => {
    expect(leafFor(0.5, 'bud')).toBe('pair')
    expect(leafFor(1, 'bud')).toBe('bud')
    expect(leafFor(2, 'triple')).toBe('triple')
  })
})
