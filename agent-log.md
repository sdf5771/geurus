# agent-log — Geurus (인덱스)

> PM 컨텍스트 캐시. 세션이 시작되면 **이 파일만 먼저** 읽고, 필요한 하위 파일만 연다.
> **정본은 `docs/GEURUS_PROJECT_CONTEXT.md`** — 로그는 요약·진행 상태이며, 충돌하면 정본을 따른다.

---

## 현재 진행 상태 (최종 갱신: 2026-09-16)

| 항목 | 상태 |
|---|---|
| 단계 | **마일스톤 1(오버레이 셸) — 구현·검증 완료, PR 준비** |
| 브랜치 | `feat/m1-overlay-shell` → base `main` · 로컬 커밋, **push 안 함** |
| 검증 | review **Ready** · qa 최종 재검증 **전 항목 통과, 새 버그 없음** · vision **이탈 없음** · test 240 · typecheck·build·`snapshot:check` 통과 |
| 남은 일 | 사용자: push·PR 생성·머지 · 수동 체크리스트 실행 · 아래 결정 대기 항목 |

### 다음에 할 일

1. 사용자 결정(머지 방식) 반영해 PR 본문 확정 → 사용자가 push·PR 생성 (`gh pr create`는 PM이 하지 않음)
2. 사용자 수동 체크리스트(`docs/qa/M1_MANUAL_CHECKLIST.md`) 결과 수신 → 실패 항목 있으면 backend/frontend 배정
3. 머지 후 2단계(데이터 레이어) 착수 — **IPC 스키마 backend↔frontend 선합의부터**

## 머지 대기 PR

| PR | 브랜치 | 상태 |
|---|---|---|
| (미생성) | `feat/m1-overlay-shell` | PR 본문 제공 완료 · 사용자 생성 대기 · 스쿼시 머지 권장(앞쪽 커밋 2개 단독 빌드 실패) |

## 미해결 · 사용자 결정 대기

- [ ] **머지 방식** — 스쿼시 권장 / 커밋 보존 시 커밋 정리 필요 → [history](agent-log/history/2026-09.md)
- [ ] **그루 클릭 시 포커스 정책**(`focusable`) — 체크리스트 6번 결과 근거 → [interfaces](agent-log/interfaces.md)
- [ ] **stretch 잎 겹침** A 그대로 / B 원본 재검토 / C 계약 명시 → [design](agent-log/design.md)
- [ ] **정본 문구 차이 3건 + 옛 파일명** (정본은 사용자가 갱신) → [design](agent-log/design.md)
- [ ] **Electron 30 지원 종료 · audit 7건** — 지금 업그레이드 / 5단계 infra 검토 → [stack](agent-log/stack.md)
- [ ] `docs/WRITING_GUIDE.md` 미생성 (원본 `docs/design/writing-guide.html`)
- [ ] 후속 백로그 Nit-A~D · Nit-1(3단계 전) → [history](agent-log/history/2026-09.md)
- [ ] 멀티모니터 창 위치 정책 · 창 위치 저장 — 4단계
- [ ] 공개 배포 여부 · 디자인 시스템 공유 방식 · 커밋/브랜치 규약 (정본 7·8절)

## 최근 중요한 결정

| 결정 | 기록 |
|---|---|
| 1단계 범위 축소 — 셸·sprout 트레이·데이터 이식·정지 그루만, 상태 토글 없음 (사용자) | [product](agent-log/product.md) |
| EXPR 키별 원본 지정 — think·sleepy는 finishing-set (zzz는 sleepy 전용) | [design](agent-log/design.md) |
| 클릭 통과 복귀는 `did-navigate`·크래시에서만 + 렌더러 `sync()` 이중 복구 (이벤트 순서 실측 근거) | [architecture](agent-log/architecture.md) |
| dev 서버 모드는 단일 인스턴스 잠금 생략 (잠금 true인데 ready 안 오는 경합) | [architecture](agent-log/architecture.md) |
| 창 위치: `workArea` 기준 계산, 저장·복원 금지 (사용자) | [interfaces](agent-log/interfaces.md) |

## 분할 로그 인덱스

| 파일 | 내용 | 최종 갱신 |
|---|---|---|
| [stack.md](agent-log/stack.md) | 스택·설치 버전·명령·빌드 구성·실행 환경·에이전트 배치·위임 운영 교훈 | 2026-09-16 |
| [interfaces.md](agent-log/interfaces.md) | 역할 경계·IPC 계약 v1·창 조건(위치·포커스) | 2026-09-16 |
| [architecture.md](agent-log/architecture.md) | main 창·복구·탐색 차단·크래시·단일 인스턴스·CSP 결정과 이유, 이벤트 순서 실측표, 렌더러 래스터·히트박스 | 2026-09-16 |
| [design.md](agent-log/design.md) | `docs/design` 5종 매핑·EXPR 원본 지정·원본 데이터 이슈·브랜드 하드 룰·라이팅 | 2026-09-16 |
| [product.md](agent-log/product.md) | 프로젝트 개요·마일스톤·1단계 확정 범위·제품 결정 대기 | 2026-09-16 |
| [history/2026-09.md](agent-log/history/2026-09.md) | 초기 세팅·M1 구현/검증/수정 라운드 1·2 커밋 이력·후속 백로그 | 2026-09-16 |

## 문서 위치

| 경로 | 내용 |
|---|---|
| `docs/GEURUS_PROJECT_CONTEXT.md` | **정본 v2.5** |
| `docs/GEURUS_PM_BRIEF.md` | PM 지시서 — 역할 경계·하드 룰·마일스톤 위임 순서 |
| `docs/GEURUS_DESIGN_BRIEF.md` | Claude Design 발주서 |
| `docs/transcript-schema.md` | JSONL 실측 스키마 |
| `docs/design/` | 디자인 원본 5종 (라이팅 가이드 포함) |
| `docs/qa/M1_MANUAL_CHECKLIST.md` | 1단계 수동 테스트 체크리스트 (12항목) |

## PR · 머지 규칙 (프로젝트 지시가 CLAUDE.md 기본값보다 우선)

- **머지 권한은 사용자.** PM은 리뷰까지만
- base 브랜치는 사용자에게 확인(현재 `main` 확정) · 본문은 마크다운 코드블록 텍스트로 제공 · **`gh pr create` 자동 생성 금지**
- 로그·문서는 해당 작업 PR에 함께 커밋 · `CLAUDE.md`·`.claude/`는 절대경로 심볼릭 링크라 커밋하지 않음
