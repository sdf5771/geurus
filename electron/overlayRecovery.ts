/**
 * 오버레이 창의 탐색 차단과 클릭 통과 복구 (순수 로직, Electron 비의존).
 *
 * 렌더러가 ignore=false로 바꾼 뒤 문서가 새로 로드되거나 프로세스가 죽으면, 되돌리는 IPC가 오지 않아
 * 창이 클릭을 계속 가로챈다. main이 "새 문서가 실제로 커밋된 시점"과 "렌더러 종료 시점"에 되돌린다.
 * 새 문서는 마운트 시 렌더러 sync()가 다시 맞추므로 이중 복구 구조가 된다.
 *
 * Electron 30 실측 이벤트 순서 (main frame):
 * - 막힌 외부 탐색     : did-start-loading → did-start-navigation → will-navigate(preventDefault) → did-stop-loading
 * - 렌더러 reload      : did-start-loading → did-start-navigation → will-navigate(허용) → did-frame-navigate → did-navigate → …
 * - main reload        : did-start-loading → did-start-navigation → did-frame-navigate → did-navigate → …  (will-navigate 없음)
 * - same-document      : did-start-loading → did-start-navigation(sameDoc) → did-navigate-in-page → did-stop-loading
 * - 크래시             : render-process-gone → (reload) → did-start-loading → … → did-navigate → …
 * did-start-loading·did-start-navigation은 will-navigate보다 먼저 와서 차단 여부를 알 수 없다.
 * 따라서 되돌리기는 cross-document 커밋에만 발생하는 `did-navigate`에서 한다.
 */

import type { IgnoreMouseTarget } from './ignoreMouse'

/** 클릭 통과(forward) 기본 상태로 되돌린다. 창이 없거나 파괴됐으면 false. */
export function resetIgnoreMouse(target: IgnoreMouseTarget | null): boolean {
  if (!target || target.isDestroyed()) return false
  target.setIgnoreMouseEvents(true, { forward: true })
  return true
}

function withoutHash(raw: string): string | null {
  try {
    const url = new URL(raw)
    url.hash = ''
    return url.href
  } catch {
    return null
  }
}

export interface NavigationScope {
  /** 앱 진입 URL. 빌드: file://…/dist/index.html, dev: dev 서버 URL */
  appUrl: string
  /** dev 서버 모드일 때만 지정. 이 origin 안의 탐색(Vite full reload 등)은 허용한다. */
  devOrigin?: string | null
  /** 현재 문서 URL. 같은 문서 재로드는 허용한다. */
  currentUrl?: string | null
}

/** 같은 문서 재로드·앱 진입 URL·dev 서버 origin만 허용한다. 그 밖(외부 사이트 등)은 차단 대상. */
export function isAllowedNavigation(target: string, scope: NavigationScope): boolean {
  const normalized = withoutHash(target)
  if (normalized === null) return false

  if (scope.devOrigin) {
    try {
      if (new URL(target).origin === new URL(scope.devOrigin).origin) return true
    } catch {
      // devOrigin 형식 오류 → 아래 비교로 넘어간다
    }
  }

  const candidates = [scope.appUrl, scope.currentUrl]
  return candidates.some((c) => typeof c === 'string' && withoutHash(c) === normalized)
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
 * 크래시 루프를 막는 재로드 판정기. now는 단조 시계(ms)여야 한다(시스템 시각 변경 영향 방지).
 * 호출할 때마다 기록하므로 true를 받으면 실제로 재로드해야 한다.
 *
 * TODO(2단계 이후): 한도를 넘어 재로드를 멈추면 그루가 사라진 채로 남는다. 트레이 상태 등으로 사용자 알림 검토.
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

/** will-navigate 이벤트 중 쓰는 부분 */
export interface PreventableEvent {
  preventDefault(): void
}

function isPreventable(event: unknown): event is PreventableEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof (event as { preventDefault?: unknown }).preventDefault === 'function'
  )
}

/** BrowserWindow 중 이 모듈이 쓰는 부분만 추린 최소 인터페이스 */
export interface RecoverableOverlay extends IgnoreMouseTarget {
  readonly webContents: {
    on(event: string, listener: (...args: unknown[]) => void): unknown
    reload(): void
    getURL(): string
  }
}

export interface OverlayRecoveryOptions {
  /** 앱 진입 URL과 dev origin. currentUrl은 webContents.getURL()로 채운다. */
  scope: Omit<NavigationScope, 'currentUrl'>
  shouldReload?: (reason: string, now: number) => boolean
  /** 단조 시계(ms). 기본 performance.now() */
  now?: () => number
  onGone?: (reason: string, reloading: boolean) => void
  onBlockedNavigation?: (url: string) => void
}

/**
 * - `will-navigate`: 앱 범위 밖 탐색만 preventDefault. 같은 문서 재로드(렌더러 location.reload, Vite full reload)는 허용
 * - `did-navigate`(main frame cross-document 커밋): 클릭 통과로 되돌림. 막힌 탐색·same-document 탐색에는 발생하지 않는다
 * - `render-process-gone`: 클릭 통과로 되돌리고, 정책이 허용하면 재로드
 */
export function bindOverlayRecovery(win: RecoverableOverlay, options: OverlayRecoveryOptions): void {
  const shouldReload = options.shouldReload ?? createCrashReloadPolicy()
  const now = options.now ?? (() => performance.now())

  win.webContents.on('will-navigate', (event, url) => {
    const target = typeof url === 'string' ? url : ''
    const allowed = isAllowedNavigation(target, {
      ...options.scope,
      currentUrl: win.isDestroyed() ? null : win.webContents.getURL(),
    })
    if (allowed) return
    if (isPreventable(event)) event.preventDefault()
    options.onBlockedNavigation?.(target)
  })

  win.webContents.on('did-navigate', () => {
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
