# 에이전트 간 계약 · 역할 경계

> 최종 갱신: 2026-09-15

## 역할 경계 (Electron 특수 규칙 — PM 브리프 5절)

| 영역 | 담당 |
|---|---|
| `electron/**`, `shared/**`, vite·vitest·tsconfig, `package.json`, `index.html`, `.gitignore` — 창·트레이·IPC 핸들러·워처·JSONL 파싱·Herdr 소켓·수명주기·빌드 구성 | **backend** |
| `src/**`, `scripts/**` — React·캔버스 렌더·스프라이트 래스터화·애니메이션 루프·Zustand·스냅샷 스크립트 | **frontend** |
| 시안이 **없는** 신규 화면(설정 창·트레이 메뉴 확장·온보딩) | **web-design** |
| `docs/**`, `agent-log*`, `README.md` | **PM** |

- IPC 메시지 스키마는 backend↔frontend **선합의**, PM 조율
- `POSE`/`LEAF`/`EXPR`/`MOTION`/`BUBBLE`/`GARDEN`/`AGENT_TYPE`/`TRAY`는 HTML 원본에서 **이식만** (재설계 금지)

## IPC 계약 v1 (1단계, PM 확정 2026-09-15)

- 공유 파일 `shared/ipc.ts` — 채널 상수 `IPC.overlaySetIgnoreMouse` + `GeurusApi` 타입 + `window.geurus?: GeurusApi` 전역 선언(선택 속성)
- 채널 `overlay:set-ignore-mouse` — renderer→main, `ipcRenderer.send`, payload `boolean` (`true` = 클릭 통과)
- preload: `contextBridge.exposeInMainWorld('geurus', { setIgnoreMouseEvents(ignore) })` — **이 함수 하나만** 노출
- main 핸들러(`electron/ignoreMouse.ts`): 창 존재·미파괴 + `event.sender === overlay.webContents` + `typeof payload === 'boolean'`일 때만 적용. `true` → `setIgnoreMouseEvents(true, { forward: true })`, `false` → `setIgnoreMouseEvents(false)`
- 렌더러(`src/overlay/hitTracker.ts`): 히트 상태가 **바뀔 때만** 전송. 마운트 시 `sync()`로 `true` 1회. `mouseleave`·cleanup 시 안에 있었으면 `true`
- 복구 책임 분담: main이 새 문서 커밋(`did-navigate`)·크래시에서 `true` 복귀, 렌더러가 마운트 `sync()` — **이중 복구** ([architecture.md](architecture.md))

## 사용자 확정 조건 (창)

- 초기 위치: 주 디스플레이 작업 영역 우하단 **임시** 배치. **좌표 하드코딩 금지** → `screen.getPrimaryDisplay().workArea` 기준 (`electron/overlayBounds.ts` `bottomRightPosition`, 360×240, 여백 16)
- **창 위치 저장·복원 금지** — 멀티모니터 정책 없이 저장하면 모니터 분리 시 화면 밖에 뜸. 4단계에서 정책과 함께
- 포커스: 실행 시 포커스를 가져가지 않음(`show:false` → `showInactive()`). **그루 클릭 시 포커스 정책(`focusable`)은 사용자 결정 대기**

## 다음 단계 합의 필요

- 2단계: 서브에이전트 목록·상태 푸시 IPC 스키마 — **backend↔frontend 선합의 후 구현**
