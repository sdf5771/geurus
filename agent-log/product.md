# 제품 범위 · 마일스톤

> 최종 갱신: 2026-09-15 · 정본: `docs/GEURUS_PROJECT_CONTEXT.md` 1~2절

## 프로젝트

- **Geurus** — Claude Code 서브에이전트를 캐릭터 「그루」로 띄우는 macOS 데스크톱 오버레이. *"에이전트 하나, 그루 하나."*
- 저장소 `github.com/sdf5771/geurus` (기본 브랜치 `main`) · 형제 프로젝트 GitGrove(`sdf5771/gitgrove`)와 캐릭터·디자인 시스템 공유
- 형태: **정원 패널 우선**(360×240). 전체 화면 로밍 보류
- Claude Code를 **관찰만** 함(읽기 전용, 훅 미설치, `~/.claude/settings.json` 미수정). LLM 호출 없음

## 마일스톤

| # | 단계 | 담당 | 상태 |
|---|---|---|---|
| 0 | 사전 조사 | — | ✅ |
| 0.5 | 디자인 시안 ①~⑦ | Claude Design | ✅ |
| 1 | 오버레이 셸 | backend → frontend → qa → review → vision | ✅ **PR #1 머지** [2026-09-16] · 수동 검증 일부 대기 |
| 2 | 데이터 레이어 (JSONL 워처 → IPC) | backend (IPC 스키마 선합의) | ⬜ **다음 작업** |
| 3 | 모션 시스템 | frontend | ⬜ |
| 4 | 말풍선 · 정원 패널 | frontend (신규 화면은 web-design 선행) | ⬜ |
| 5 | 배포 | infra | ⬜ |

## 1단계 확정 범위 [결정일: 2026-09-15, 사용자]

> 목적은 **기술 리스크 제거**. 투명창·클릭통과·트레이가 macOS에서 의도대로 되는지 먼저 확인하고, 통과한 뒤 그 위에 얹는다.

| 포함 | 제외 (1단계 이후) |
|---|---|
| Electron 오버레이 셸 — 투명·프레임 없음·항상 위·클릭 통과 | `AGENT_TYPE` 매핑 |
| 트레이 — **`sprout` 글리프 1종 + `종료` 메뉴만** | 트레이 상태 3종(`sprout-tall`·`sprout-alert`·타이틀·깜빡임) |
| 스프라이트 데이터 이식 `PAL`·`POSE`·`LEAF`·`EXPR` + 배율별 래스터화 | 빈/에러 상태 컴포넌트 |
| 그루 1마리 정지 렌더(`stand` + `idle`) + 히트박스 클릭 판정 | **개발용 상태 토글 — 만들지 않음** (2단계에서 실제 데이터로 검증) |

- 최초 요청 「`Geurus 마감 세트.html` 구현」은 이 범위로 조정됨. 마감 세트 중 1단계 포함은 `LEAF`/`LEAF_OFFSET`과 `TRAY_GLYPH.sprout`뿐
- 창 위치 저장·멀티모니터 정책·드래그 그립은 4단계

## 2단계(데이터 레이어) 착수 메모

- 입력: `~/.claude/projects/<enc-cwd>/<sessionId>/subagents/*.meta.json`(목록·`agentType`·`description`·`toolUseId`·`spawnDepth`) · `subagents/agent-<id>.jsonl`(실행 중 툴) · 부모 `<sessionId>.jsonl`(비동기 완료 알림). 스키마는 `docs/transcript-schema.md`
- **판정 함정 3가지**: 툴명은 `Agent`(`Task` 아님) · 서브에이전트는 별도 파일(부모에 `isSidechain` 없음) · **대부분 비동기 spawn이라 `tool_result`로 완료를 판정하면 전부 오판** → 부모의 `<task-notification>` 문자열로 판정
- 프로젝트 식별은 **레코드의 `cwd` 필드**(디렉터리명 인코딩 역변환 금지). 감시는 **디렉터리 감시**(chokidar `add`) — 서브에이전트 파일은 작업 도중 생김
- 실시간 flush는 검증됨(훅 불필요). `~/.claude/`는 **읽기만**
- 실패·취소 시 `status` 실제 값은 표본에 없음 → **블랙리스트**(`completed` 아니면 비정상 종료)
- 이때 함께 정할 것: **그루 클릭 시 동작**과 그에 따른 `focusable` 정책 ([interfaces.md](interfaces.md))

## 사용자 결정 대기 (제품·정책)

- 그루 클릭 시 포커스 정책(`focusable`) — 체크리스트 6번 결과를 근거로
- 공개 배포 여부(코드사인·공증), 디자인 시스템 공유 방식(정본 8-1)
- 커밋·브랜치 규약(정본 7절)
