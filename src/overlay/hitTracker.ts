/**
 * 커서가 그루 히트박스 안에 있는지 추적하고, **상태가 바뀔 때만** 클릭 통과 여부를 보낸다.
 * 초기 상태는 "밖" — main이 창 생성 직후 이미 클릭 통과(`true`)로 두므로 첫 호출은 필요 없다.
 */
export interface HitTracker {
  /** mousemove마다 호출. 히트 여부가 바뀌었을 때만 `setIgnore`를 부른다 */
  update(isHit: boolean): void
  /** 커서가 창을 벗어났을 때. 안에 있던 상태면 클릭 통과(`true`)로 복귀 */
  leave(): void
  readonly isOver: boolean
}

export function createHitTracker(setIgnore: (ignore: boolean) => void): HitTracker {
  let isOver = false
  const tracker: HitTracker = {
    update(isHit) {
      if (isHit === isOver) return
      isOver = isHit
      setIgnore(!isHit)
    },
    leave() {
      tracker.update(false)
    },
    get isOver() {
      return isOver
    },
  }
  return tracker
}
