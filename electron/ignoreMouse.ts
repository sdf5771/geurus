/**
 * `overlay:set-ignore-mouse` 핸들러의 순수 로직. Electron에 의존하지 않아 단위 테스트가 가능하다.
 */

export type IgnoreMouseCall =
  | { ignore: true; options: { forward: true } }
  | { ignore: false }

/** payload가 boolean이 아니면 null(무시). */
export function resolveIgnoreMouse(payload: unknown): IgnoreMouseCall | null {
  if (payload === true) return { ignore: true, options: { forward: true } }
  if (payload === false) return { ignore: false }
  return null
}

/** BrowserWindow 중 핸들러가 쓰는 부분만 추린 최소 인터페이스 */
export interface IgnoreMouseTarget {
  readonly webContents: unknown
  isDestroyed(): boolean
  setIgnoreMouseEvents(ignore: boolean, options?: { forward?: boolean }): void
}

/**
 * 보낸 쪽이 오버레이 창의 webContents이고 payload가 boolean일 때만 적용한다.
 * @returns 실제로 setIgnoreMouseEvents를 호출했으면 true
 */
export function applySetIgnoreMouse(
  target: IgnoreMouseTarget | null,
  sender: unknown,
  payload: unknown,
): boolean {
  if (!target || target.isDestroyed()) return false
  if (sender !== target.webContents) return false

  const call = resolveIgnoreMouse(payload)
  if (!call) return false

  if (call.ignore) {
    target.setIgnoreMouseEvents(true, call.options)
  } else {
    target.setIgnoreMouseEvents(false)
  }
  return true
}
