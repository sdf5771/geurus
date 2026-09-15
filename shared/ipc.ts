/**
 * main ↔ preload ↔ renderer IPC 계약 (1단계 오버레이 셸).
 * backend(electron/**)와 frontend(src/**)가 함께 import한다. 변경 시 양쪽 합의 필요.
 */

export const IPC = {
  /** renderer → main (send). payload: boolean. true=클릭 통과(forward), false=클릭 받음 */
  overlaySetIgnoreMouse: 'overlay:set-ignore-mouse',
} as const

export type IpcChannel = (typeof IPC)[keyof typeof IPC]

/** preload가 `window.geurus`로 노출하는 렌더러 API */
export interface GeurusApi {
  /**
   * 오버레이 창의 마우스 이벤트 무시 여부를 바꾼다.
   * - `true`: 클릭은 아래 앱으로 통과, mousemove는 렌더러로 계속 전달(forward)
   * - `false`: 창이 클릭을 받는다 (커서가 그루 히트박스 안에 있을 때)
   */
  setIgnoreMouseEvents(ignore: boolean): void
}

declare global {
  interface Window {
    geurus: GeurusApi
  }
}
