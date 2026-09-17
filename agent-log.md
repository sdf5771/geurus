# agent-log — Geurus (인덱스)

> PM 컨텍스트 캐시. 세션이 시작되면 **이 파일만 먼저** 읽고, 필요한 하위 파일만 연다.
> **정본은 `docs/GEURUS_PROJECT_CONTEXT.md`** — 로그는 요약·진행 상태이며, 충돌하면 정본을 따른다.

---

## 인계 브리핑 (이어받는 에이전트가 먼저 읽을 것)

**지금 상태 한 줄** — 마일스톤 1(오버레이 셸) 완료·머지됨. **다음 작업은 마일스톤 2(데이터 레이어)**이고, 시작 전에 **Electron 업그레이드 여부(사용자 판단)** 가 걸려 있다.

| 확인할 것 | 값 |
|---|---|
| 저장소 | `github.com/sdf5771/geurus` · 기본 브랜치 `main` · 현재 main = PR #2까지 반영 |
| 실행 확인 | `npm install` → `npm test`(240 통과) → `npm run build` → `npm start` |
| 앱 종료 | 메뉴바 새싹 아이콘 → `종료` (독 아이콘 없음) |
| 커밋 안 하는 파일 | `CLAUDE.md`, `.claude/`, `AGENTS.md` — 에이전트 정의는 `~/Documents/GitHub/my-agents`를 가리키는 **절대경로 심볼릭 링크** |
| 미실행 | **수동 체크리스트 `docs/qa/M1_MANUAL_CHECKLIST.md` 12항목** — OS 수준 클릭 통과·Space·메뉴바 반전은 사람만 확인 가능 |

**함정 (모르면 반드시 밟는 것)**

1. **`docs/design/`은 지우면 안 된다** — `npm run snapshot:check`가 이 HTML을 입력으로 스프라이트 데이터를 대조한다
2. **`EXPR`은 키별로 원본이 다르다** — `motion-system.html`의 `think`에는 옛 zzz가 남아 있다. zzz는 `sleepy` 전용 ([design.md](agent-log/design.md))
3. **dev는 단일 인스턴스 잠금이 없다** — 빌드와 동시에 띄우면 그루가 2마리. DevTools는 `GEURUS_DEVTOOLS=1 npm run dev`
4. **`~/.claude/`는 읽기만** — 훅 설치·`settings.json` 수정 금지 (2단계에서도 워처 방식 유지)
5. **클릭 통과 복구 설계는 Electron 30 이벤트 순서 실측에 의존** — 버전을 올리면 재측정 필수 ([architecture.md](agent-log/architecture.md))
6. **앱을 띄우거나 파일을 만지는 에이전트를 동시에 돌리지 않는다** — 실제로 충돌할 뻔했다 ([stack.md](agent-log/stack.md))

**⚠️ 에이전트 배치가 툴마다 다르다** [확인 2026-09-17]

| 툴 | 경로 | 배치 |
|---|---|---|
| Claude Code | `.claude/agents/*.md` | backend · frontend · infra · product-planner · qa · researcher · review · vision · web-design (9) |
| **Codex** | `.codex/agents/*.toml` | **backend · frontend · qa · review (4)** |

- `AGENTS.md`의 `ls .Codex/agents/`는 대소문자가 틀렸다. 실제 경로는 **`.codex/agents/`**
- Codex에는 **vision·infra·product-planner·researcher·web-design이 없다.** 1단계에서 실제로 쓴 vision(브랜드 감사)·infra(Electron 검토)를 Codex에서는 위임할 수 없으므로, 그 영역 작업이 생기면 **사용자에게 먼저 알리고** 범위를 조정하거나 Claude Code 쪽으로 넘길 것
- 배치된 4종은 1단계를 돌린 구성과 같으므로, 2단계(backend 워처·IPC → frontend 렌더 → qa → review)는 Codex 배치만으로 진행 가능

---

## 현재 진행 상태 (최종 갱신: 2026-09-17)

| 항목 | 상태 |
|---|---|
| 단계 | **마일스톤 1(오버레이 셸) 완료** · 진행 중인 구현 작업 없음 |
| main | `7c37131 docs: 정본 v2.6 (#2)` ← `8aa0443 feat: 마일스톤 1 오버레이 셸 (#1)`. 두 PR 모두 **스쿼시 머지**, 브랜치 삭제됨 |
| 검증 | 자동: test **240**·typecheck·build·`snapshot:check` 통과 · review **Ready** · qa 전 항목 통과 · vision **이탈 없음** / 수동: **미실행** |
| 환경 | 개발 머신 Node **v23.11.0** (Electron 업그레이드하려면 24 LTS 필요) |
| 남은 일 | 수동 체크리스트 실행 · Electron 판단 · 2단계 착수 |

### 다음에 할 일

1. **Electron 업그레이드 여부 결정** (아래 미해결 항목) — 올린다면 **2단계 착수 전에**, 순서는 ① 사용자 Node 24 설치 + 30에서 WindowServer 기준선 측정 ② infra가 의존성 교체 ③ backend가 이벤트 순서 재측정 ④ 수동 체크리스트
2. 수동 체크리스트(`docs/qa/M1_MANUAL_CHECKLIST.md`) 결과 수신 → 실패 항목은 backend/frontend에 배정 (**OS 수준 실클릭 통과·Space·메뉴바 반전은 아직 사람 확인 전**)
3. 2단계(데이터 레이어) 착수 — **IPC 스키마 backend↔frontend 선합의부터**. 입력 스키마는 `docs/transcript-schema.md`, 판정 함정은 [architecture](agent-log/architecture.md)·정본 3-3

## 머지 대기 PR

- 없음 (PR #1·#2 머지 완료)

## 미해결 · 사용자 결정 대기

- [x] **머지 권한·방식** — PM 위임 [2026-09-16], 스쿼시 머지로 진행 중(PR #1·#2 적용)
- [ ] **그루 클릭 시 포커스 정책**(`focusable`) — **보류 확정** [2026-09-16]. 1단계엔 클릭 동작이 없어 지금 정할 필요 없음. **2단계에서 "클릭하면 무엇을 할지"가 정해질 때 함께 결정**하고, 그때 qa가 두 설정을 실측해 근거를 만든다. 그 전까지는 현 상태(포커스를 받음) 유지 → [interfaces](agent-log/interfaces.md)
- [x] **stretch 잎 겹침 → C 확정** [사용자 2026-09-16]: 그대로 두고 정본 3-8에 "키 삽입 순서·나중 키 우선" 계약 명시. 3단계에서 모션이 재생될 때 어색하면 그때 디자인 원본을 손본다
- [x] **정본·브리프 정정** [사용자 허가 2026-09-16, PM이 직접 수정] — 정본 v2.6
- [ ] **Electron 업그레이드** — infra 검토 완료: **지금(2단계 전) 30.5.1 → 44.4.1 권고.** scratchpad 실측으로 audit 0건·테스트 240 통과·코드 수정 0줄 확인. 이유는 수동 체크리스트를 **두 번 태우지 않기 위함**. 사전 조건 **Node 24 LTS 설치(사용자)** → 사용자 판단 대기 → [stack](agent-log/stack.md)
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
| [stack.md](agent-log/stack.md) | 스택·설치 버전·명령·빌드 구성·실행 환경·에이전트 배치·**Electron 44 업그레이드 검토** | 2026-09-17 |
| [interfaces.md](agent-log/interfaces.md) | 역할 경계·IPC 계약 v1·창 조건(위치·포커스 보류 결정) | 2026-09-16 |
| [architecture.md](agent-log/architecture.md) | main 창·복구·탐색 차단·크래시·단일 인스턴스·CSP 결정과 이유, **이벤트 순서 실측표(Electron 30 기준)**, 렌더러 래스터·히트박스 | 2026-09-16 |
| [design.md](agent-log/design.md) | `docs/design` 5종 매핑·**EXPR 키별 원본 지정**·stretch 잎 계약·브랜드 하드 룰·라이팅 | 2026-09-16 |
| [product.md](agent-log/product.md) | 마일스톤·1단계 확정 범위·**2단계 착수 메모(입력·판정 함정)**·제품 결정 대기 | 2026-09-17 |
| [history/2026-09.md](agent-log/history/2026-09.md) | M1 구현/검증/수정 라운드 이력·**머지 결과(PR #1·#2)**·Electron 검토·후속 백로그 | 2026-09-17 |

## 문서 위치

| 경로 | 내용 |
|---|---|
| `docs/GEURUS_PROJECT_CONTEXT.md` | **정본 v2.5** |
| `docs/GEURUS_PM_BRIEF.md` | PM 지시서 — 역할 경계·하드 룰·마일스톤 위임 순서 |
| `docs/GEURUS_DESIGN_BRIEF.md` | Claude Design 발주서 |
| `docs/transcript-schema.md` | JSONL 실측 스키마 |
| `docs/design/` | 디자인 원본 5종 (라이팅 가이드 포함) |
| `docs/qa/M1_MANUAL_CHECKLIST.md` | 1단계 수동 테스트 체크리스트 (12항목) |

## PR · 머지 규칙

- **머지 권한: PM에게 위임됨** [사용자 지시 2026-09-16] — PM이 push·PR 생성·리뷰·머지까지 진행. 매번 묻지 않음
  - 단, 다음은 머지 전 사용자 확인: 미해결 blocker(QA 실패·review Blocker·vision 이탈·인터페이스 불일치) · 파괴적 인프라 변경·DB 마이그레이션·비가역 배포 · 가격/과금 정책 변경 · 충돌 해결 필요
  - 이전 규칙(정본 7절 "머지는 사용자", "`gh pr create` 금지")은 이 지시로 대체됨
- base 브랜치 `main` · 스택 PR이면 머지 순서 주의(CLAUDE.md 「스택 PR 주의」)
- 로그·문서는 해당 작업 PR에 함께 커밋 · `CLAUDE.md`·`.claude/`는 절대경로 심볼릭 링크라 커밋하지 않음
- 로그·문서는 해당 작업 PR에 함께 커밋 · `CLAUDE.md`·`.claude/`는 절대경로 심볼릭 링크라 커밋하지 않음
