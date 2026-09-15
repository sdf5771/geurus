/**
 * 렌더러 재로드·크래시 시 오버레이 상태 복구 (순수 로직, Electron 비의존).
 *
 * 렌더러가 ignore=false로 바꾼 뒤 재로드되거나 죽으면, 되돌리는 IPC가 오지 않아
 * 창이 클릭을 계속 가로챈다. main이 로드 시작·프로세스 종료 시점에 클릭 통과로 되돌린다.
 */

import type { IgnoreMouseTarget } from './ignoreMouse'

/** 클릭 통과(forward) 기본 상태로 되돌린다. 창이 없거나 파괴됐으면 false. */
export function resetIgnoreMouse(target: IgnoreMouseTarget | null): boolean {
  if (!target || target.isDestroyed()) return false
  target.setIgnoreMouseEvents(true, { forward: true })
  return true
}

/** 크래시 뒤 자동 재로드할 종료 사유. clean-exit·launch-failed·integrity-failure 등은 재로드해도 소용없다. */
export const RELOADABLE_GONE_REASONS: ReadonlySet<string> = new Set([
  'crashed',
  'oom',
  'abnormal-exit',
  'killed',
])

export interface CrashReloadLimit {
  /** windowMs 안에서 허용할 최대 재로드 횟수 */
  maxReloads: number
  windowMs: number
}

export const DEFAULT_CRASH_RELOAD_LIMIT: CrashReloadLimit = { maxReloads: 3, windowMs: 60_000 }

/**
 * 크래시 루프를 막는 재로드 판정기. 호출할 때마다 now를 기록하므로 true를 받으면 실제로 재로드해야 한다.
 */
export function createCrashReloadPolicy(limit: CrashReloadLimit = DEFAULT_CRASH_RELOAD_LIMIT) {
  let reloads: number[] = []
  return (reason: string, now: number): boolean => {
    if (!RELOADABLE_GONE_REASONS.has(reason)) return false
    reloads = reloads.filter((t) => now - t < limit.windowMs)
    if (reloads.length >= limit.maxReloads) return false
    reloads.push(now)
    return true
  }
}

export function goneReason(details: unknown): string {
  if (typeof details === 'object' && details !== null && 'reason' in details) {
    const { reason } = details as { reason: unknown }
    if (typeof reason === 'string') return reason
  }
  return 'unknown'
}

/** BrowserWindow 중 복구 로직이 쓰는 부분만 추린 최소 인터페이스 */
export interface RecoverableOverlay extends IgnoreMouseTarget {
  readonly webContents: {
    on(event: string, listener: (...args: unknown[]) => void): unknown
    reload(): void
  }
}

export interface OverlayRecoveryOptions {
  shouldReload?: (reason: string, now: number) => boolean
  now?: () => number
  onGone?: (reason: string, reloading: boolean) => void
}

/**
 * - `did-start-loading`(재로드·HMR 전체 리로드 포함): 클릭 통과로 되돌림
 * - `render-process-gone`: 클릭 통과로 되돌리고, 정책이 허용하면 재로드
 */
export function bindOverlayRecovery(win: RecoverableOverlay, options: OverlayRecoveryOptions = {}): void {
  const shouldReload = options.shouldReload ?? createCrashReloadPolicy()
  const now = options.now ?? Date.now

  win.webContents.on('did-start-loading', () => {
    resetIgnoreMouse(win)
  })

  win.webContents.on('render-process-gone', (_event, details) => {
    resetIgnoreMouse(win)
    const reason = goneReason(details)
    const reloading = !win.isDestroyed() && shouldReload(reason, now())
    options.onGone?.(reason, reloading)
    if (reloading) win.webContents.reload()
  })
}
