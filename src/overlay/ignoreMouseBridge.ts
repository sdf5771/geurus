import type { GeurusApi } from '../../shared/ipc'

type IgnoreMouseBridge = Pick<GeurusApi, 'setIgnoreMouseEvents'>

/**
 * preload 브리지(`window.geurus`)로 클릭 통과 여부를 보내는 함수를 만든다.
 * 브리지가 없으면 조용히 실패하지 않도록 `onMissing`을 **한 번만** 부른다(호출부에서 dev 전용 경고).
 * 브리지는 호출할 때마다 다시 조회한다.
 */
export function createIgnoreMouseSender(
  getBridge: () => IgnoreMouseBridge | undefined,
  onMissing: () => void,
): (ignore: boolean) => void {
  let hasReportedMissing = false
  return (ignore) => {
    const bridge = getBridge()
    if (bridge) {
      bridge.setIgnoreMouseEvents(ignore)
      return
    }
    if (hasReportedMissing) return
    hasReportedMissing = true
    onMissing()
  }
}
