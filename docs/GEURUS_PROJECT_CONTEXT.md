# GEURUS 프로젝트 컨텍스트

> **문서 목적**: Geurus 관련 작업의 단일 진실 공급원(Single Source of Truth).
> 세션이 바뀌어도 맥락이 유실되지 않도록 확정 사항·미결 사항·이력을 누적 관리한다.

| 항목 | 값 |
|---|---|
| **프로젝트명 / 산출물명** | **Geurus** (그루스) [확정일: 2026-09-15] |
| **형태** | macOS 데스크톱 오버레이 앱 (Electron) |
| 최초 작성일 | 2026-09-15 |
| 최종 갱신일 | 2026-09-15 |
| 문서 버전 | v2.5 |
| 관리 담당 | *미확정* |
| 저장소 | **`github.com/sdf5771/geurus`** [확정일: 2026-09-15] |
| **형제 프로젝트** | **GitGrove** — `github.com/sdf5771/gitgrove` (브랜드·디자인 시스템 공유) |

> **v2.0에서 기획이 전환됨.**
> v0.x는 「HERDR 프로젝트 컨텍스트」(Herdr 도입), v1.0은 「YANGBONGJANG」(터미널 TUI + 벌 은유)이었다.
> 현재는 **GitGrove 마스코트 「그루」를 활용한 데스크톱 오버레이**로 확정되었고,
> 터미널 TUI 전제와 벌 은유는 **폐기**되었다. Herdr는 선택적 연동 대상으로 축소되었다.

---

## 0. LLM 운영 규칙 (Assistant Role)

### 0-1. 정보 신뢰도 위계 ⚠️ 중요

1. **실제 실행·검증 결과** (로컬 파일 확인, 실물 파싱, 직접 실행) — 최우선
2. **공식 문서 / 브랜드 자산 원본** (`GitGrove_Character.html`, `GitGrove_라이팅_가이드.html`, herdr.dev 0.8.0)
3. **관련 저장소 소스코드**
4. **본 컨텍스트 문서** 및 `claude-code-transcript-schema.md`
5. **LLM의 사전 지식(training data)** — 변화가 빠른 영역이므로 **단독 근거로 사용 금지**

> **실사례 1** — herdr docs는 Claude Code integration을 `version 6`으로 명시했으나 실제 바이너리는 **v7**을 설치했다.
>
> **실사례 2** — 서브에이전트 툴 이름을 `Task`로 추정해 grep했으나 **0건**. 실제는 **`Agent`**.
>
> **실사례 3** — Apple Terminal이 Ctrl+클릭을 가로챌 것이라 **추정**했으나 실측 결과 **정상 동작**했다.
>
> 세 건 모두 추정으로 시작해 실측으로 뒤집혔다. 위계 1번을 반드시 우선한다.

### 0-2. 답변 원칙

- 확정/미확정을 명확히 구분한다. 추측을 확정처럼 말하지 않는다.
- 근거를 함께 제시한다.
- 자료에 없는 내용은 **"자료에 없음"** 이라고 답한다. 추론으로 채우지 않는다.
- 존재하지 않는 API·필드·팔레트 키를 **지어내지 않는다.**
- **요청된 범위 안에서만 답한다.** 다음 단계를 선제적으로 밀어붙이거나 불필요한 확인을 반복하지 않는다.
- 브랜드 자산(그루 스프라이트·팔레트·카피 톤)은 **원본 파일이 정본**이다. 임의 변형 금지.

### 0-3. 용어 표기 규칙

**Geurus 도메인**

```
Project (프로젝트 = Claude Code 세션의 cwd)
 └─ Session (Claude 세션, sessionId = JSONL 파일명)
     └─ Subagent (Agent 툴로 spawn) ← 그루 한 마리에 대응
```

- 캐릭터 이름은 **그루 / Geuru** (단수), 앱 이름은 **Geurus** (복수)
- 서브에이전트 상태값은 JSONL 원문 그대로 `async_launched` / `completed`
- Herdr 상태값은 원문 그대로 `idle` / `working` / `blocked` / `done` / `unknown`
- 그루 표정 키는 원본 그대로 `idle` / `happy` / `think` / `merge` / `conflict` / `sleepy` / `blink`

### 0-4. 문서 갱신 규칙

- 새 정보 확정 시 **[추가일: YYYY-MM-DD]**, 변경 시 **[변경일: YYYY-MM-DD]** 병기
- 미결 → 확정 시 「8. 미결/리스크」에서 제거하고 본문으로 이동
- 갱신 시 상단 **최종 갱신일**·**버전**을 올리고 「11. 변경 이력」에 요약
- **"컨텍스트 갱신해줘"** → 확정된 내용을 반영해 **전체 파일 재생성**
- GitGrove 브랜드 자산이 갱신되면 4절을 재확인 대상으로 표시

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **한 줄 정의** | Claude Code의 **서브에이전트를 그루 캐릭터로 데스크톱 위에 띄우는** 오버레이 앱 |
| **은유** | **"에이전트 하나, 그루 하나"** — GitGrove의 *"커밋 하나, 새싹 하나"* 계승 |
| **핵심 가치** | 몇 개가 돌고 있고 무엇을 하는지, 무엇이 내 승인을 기다리는지를 **한눈에** |
| **형태** | macOS 데스크톱 오버레이 (항상 위 · 투명 · 클릭 통과) |
| **스택** | Electron + React + TypeScript (GitGrove와 동일) |
| **브랜딩** | GitGrove 디자인 시스템 공유. 아케이드 다크 톤 유지 |
| **저장소** | **`sdf5771/geurus`** — 별도 저장소. GitGrove에 통합하지 않음 |

### 왜 만드는가 — 빈틈

| 도구 | 서브에이전트 | 개별 표시 | 데스크톱 |
|---|---|---|---|
| Herdr 사이드바 | ❌ | — | ❌ |
| aiwatch (TUI) | ✅ | ✅ | ❌ |
| Codex Pets | ❌ | ❌ (1마리로 종합) | ✅ |
| **Geurus** | ✅ | ✅ | ✅ |

> Codex Pets는 **펫 한 마리가 세션 전체를 대표**한다.
> Geurus는 **서브에이전트마다 그루 한 마리**를 띄운다. 이것이 결정적 차이다.

### 이름 확정 경위 ⚠️ 재조사 방지

**폐기된 방향: 벌집 은유 (yangbongjang)** — 그루가 새싹 정령이라 은유가 충돌. 캐릭터를 살리는 쪽을 택함.

| 후보 | 탈락 사유 |
|---|---|
| `hive` | crates.io 점유 + hive-ai.dev (Claude Code 통합 워크스페이스) |
| `agent-hive` | 동명 3건 (tctinh OpenCode 플러그인 / kelvinyuefanli MCP / facebookresearch RL) |
| `apiary` | Oracle Apiary (API 문서화 플랫폼) |
| `agent-apiary` | AgentApiary (에이전트 오케스트레이션) |
| `waggle` | modiqo/waggle — Rust + cargo + Claude Code + tmux. 최악의 충돌 |
| `quorum` | quorum-rs (Rust + 멀티에이전트 + `tui` 서브커맨드) + 크레이트 점유 |
| `quorra` | 디즈니 트론 캐릭터명 (IP 위험) |
| `yangbongjang` | 충돌 없었으나 **그루 채택으로 은유 불일치** → 자진 폐기 |

**`Geurus` 검색 결과 충돌 0건** [확인일: 2026-09-15]

---

## 2. 마일스톤

| # | 단계 | 내용 | 상태 |
|---|---|---|---|
| 0 | 사전 조사 | 도구 서베이 · JSONL 스키마 실측 · 브랜드 자산 확보 · 스택 확정 | ✅ |
| 0.5 | **디자인 시안** | 산출물 ①~⑦ 전부 수령. **디자인 완결** | ✅ [2026-09-15] |
| 1 | **오버레이 셸** | 투명·항상위·클릭통과 창 + **트레이 아이콘** + 그루 1마리 렌더 | ⬜ 착수 전 |
| 2 | **데이터 레이어** | JSONL 워처 → 서브에이전트 목록·상태 | ⬜ |
| 3 | **모션 시스템** | 포즈 그리드 + 프레임 테이블 | ⬜ |
| 4 | **말풍선 · 정원 패널** | 상태·툴명 표시, 다수 배치 | ⬜ |
| 5 | (선택) Herdr 연동 | 소켓 조회 → pane 점프 | ⬜ |

> **1단계가 리스크를 가장 많이 걷어낸다.** Electron 투명창·클릭통과가 macOS에서 의도대로 되는지가 전체 기획의 전제다.

---

## 3. 설계

### 3-1. 오버레이 셸 (Electron)

**형태: 정원 패널 우선** [확정일: 2026-09-15]

전체 화면 로밍이 아니라 **작은 정원 패널**(360×240 전후)로 시작한다. 자유 로밍은 2단계로 미룬다.

| | 채택한 정원 패널 | 보류한 전체 화면 로밍 |
|---|---|---|
| 리스크 | 낮음 | 클릭 통과·멀티모니터 이슈 큼 |
| 가독성 | 모여 있어 파악 쉬움 | 흩어져서 오히려 안 보임 |
| 배터리 | 작은 캔버스 | 화면 전체 |

> Codex Pets는 **한 마리**라 자유 로밍이 성립하지만, Geurus는 여러 마리라 모으는 편이 낫다.

```js
new BrowserWindow({
  transparent: true,
  frame: false,
  hasShadow: false,
  alwaysOnTop: true,
  skipTaskbar: true,
})
win.setAlwaysOnTop(true, 'screen-saver')
win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
win.setIgnoreMouseEvents(true, { forward: true })   // 클릭 통과
app.dock.hide()
```

**클릭 통과 ↔ 상호작용 전환 패턴** ⚠️

`forward: true` 가 핵심이다. 클릭은 통과시키되 **`mousemove`는 렌더러로 전달**된다.

```
커서가 그루 히트박스 진입 → IPC → setIgnoreMouseEvents(false)  // 클릭 받음
커서가 벗어남              → IPC → setIgnoreMouseEvents(true)   // 다시 통과
```

이 패턴 없이는 캐릭터를 클릭할 수 없다.

**트레이 아이콘 필수** — `app.dock.hide()` 를 쓰면 종료·설정 진입 경로가 사라진다.
메뉴바 트레이가 **유일한 조작점**이 되므로 1단계에 포함해야 한다.

### 3-2. 데이터 레이어 ⚠️ 렌더링 전환과 무관하게 불변

> 근거: `claude-code-transcript-schema.md` (실측, JSONL 346개 조사)

| 소스 | 얻는 것 |
|---|---|
| `~/.claude/projects/<enc-cwd>/<sessionId>/subagents/*.meta.json` | **🔑 에이전트 목록** — `agentType`, `description`, `toolUseId`, `spawnDepth`. 파일명이 곧 `agentId` |
| 〃 `subagents/agent-<id>.jsonl` | 실행 중 툴, 활동 |
| 〃 `<sessionId>.jsonl` (부모) | 비동기 완료 알림 |
| `~/.claude/todos/` | TODO 진행 상황 |
| Herdr 소켓 (선택) | 워크스페이스/pane 구조 |

- **프로젝트 식별은 반드시 레코드의 `cwd` 필드로.** 디렉터리명 인코딩(`/`→`-`)은 역변환이 모호함
- 디렉터리 워처만으로 목록 UI가 성립 → **JSONL 전체 파싱 불필요**

**✅ 실시간 flush 검증 완료** [2026-09-15]

`tail -F` 관측 결과, 서브에이전트 실행 **도중에 줄이 계속 추가**된다. 버퍼링 없음.

→ **읽기 전용 워처 설계 확정.** Claude Code 훅을 설치하지 않으므로
`~/.claude/settings.json`을 건드리지 않고, Herdr 훅·타 모니터링 도구와 충돌하지 않는다.

⚠️ 와일드카드 감시 시 `tail -f`가 아니라 **`tail -F`** 를 쓸 것 — 작업 중 새로 생긴 파일을 따라가야 한다.
앱 구현에서도 같은 이유로 **개별 파일 감시가 아니라 디렉터리 감시**(chokidar `add` 이벤트)가 필요하다.

### 3-3. 핵심 판정 로직 ⚠️

**반드시 지킬 3가지**

1. **툴 이름은 `Agent`** (`Task` 아님)
2. **서브에이전트는 별도 파일로 완전 분리** (부모에 `isSidechain==true` 0건)
3. **대부분 비동기 spawn** — `tool_result`로 완료를 판정하면 **전부 즉시 완료로 오판**

**판정 흐름**

```
목록      : subagents/*.meta.json 디렉터리 스캔
spawn     : 부모 assistant.tool_use(name=="Agent")
            → input.subagent_type / input.description / 블록의 id = toolUseId
동기 완료  : toolUseResult.status == "completed"
            → totalDurationMs, totalTokens, toolStats 사용 가능
비동기 완료: 부모의 user 레코드 중 message.content가 «문자열»인 것
            → <task-notification> 안의 <task-id> == agentId && <status>
실행 중 툴 : 미결 tool_use 집합 (대응 tool_result가 아직 없는 tool_use.id)
조인 키    : toolUseId  ← agentId보다 견고
```

**방어할 함정**

- `async_launched` 일 때 `agentType`·수치가 전부 `null`
- `sessionId` / `session_id` 중복 → **`sessionId`를 정본으로**
- 실패·취소 시 `status` 값이 표본에 없음 → **블랙리스트 처리**
  (`completed` 아니면 전부 "비정상 종료", 실제 값 관측 시 세분화)

### 3-4. 그루 스프라이트 시스템

> 원본: `GitGrove_Character.html`(캐릭터), `Geurus_모션_시스템.html`(포즈·모션 시안) — 4절 참조

- 그루는 이미지가 아니라 **문자 그리드 + 팔레트 + 패치**다
- `renderSprite(grid, scale, patch)` → SVG `<rect>` 나열, `shape-rendering="crispEdges"`
- **Electron으로 그대로 이식 가능** (`PAL` / `POSE` / `EXPR` / `MOTION` 복사)

**구조 — 4중 레이어** [확정일: 2026-09-15]

```
POSE (몸통 그리드 16×18)
  ├ LEAF  (잎 패치 — 행 1~3, LEAF_OFFSET으로 포즈 보정)   → 타입 구분
  ├ EXPR  (눈·입 패치 — 행 8~11, 좌표 고정)              → 상태 표정
  └ fx    (프레임 한정 오버레이 픽셀 [x, y, 팔레트키])      → 땀·반짝·zzz
```

**적용 순서**: `POSE` → `LEAF` (좌표 변환 후) → `EXPR` → `fx`
LEAF는 행 1~3, EXPR은 행 8~11로 **영역이 겹치지 않으므로** 순서 충돌이 없다.

**포즈 4종 확정** — 시안 수령 [2026-09-15]

| 포즈 | 그리드 특징 |
|---|---|
| `stand` | 기존 BASE. 행 5~14 몸통, 행 15 뿌리 발 |
| `squash` | 상단 1px 눌림 · 잎 **바깥으로** · 하단 부풀고 발 벌어짐(`bbb`) |
| `stretch` | 줄기 1px 연장(`ll` 2행) · 잎 **안으로** 모임 · 발 붙음 |
| `lean` | 상단 +1 이동, 하단은 뒤에 남음 · `flip:true` 로 반대 방향 |

- 행 8~11(눈·입) 좌표는 **4종 모두 동일** → EXPR 패치가 그대로 적용됨
- 스쿼시&스트레치는 CSS `scaleY`가 아니라 **그리드로 구현** (비정수 배율은 픽셀을 뭉갬)

**`fx` 오버레이** — 발주서에 없던 시안 측 추가. 채택.
땀(`s`) · 반짝(`H`) · zzz(`z`) 를 프레임 단위로 얹는다. 이게 없으면 포즈 그리드를 상태 수만큼 복제해야 한다.

**성능 — 시작 시 래스터화**

- `renderSprite()`는 288개 `<rect>`를 생성. 매 프레임 재생성하면 배터리를 먹는다
- 기동 시 **포즈 4 × 잎 4 × 표정 6 × 배율 3 = 288장**을 오프스크린 캔버스에 구워두고 blit
  (16×18짜리라 메모리는 무시할 수준. `fx`는 blit 후 개별 픽셀로 얹는다)
- `ctx.imageSmoothingEnabled = false` 필수
- 전부 유휴면 프레임률을 초당 2~4로 낮춘다

**표정 변경 이력** [2026-09-15]
`think`에 있던 zzz(`8,13`·`7,13`)가 제거되고 `sleepy`로 이동(`5,13`·`4,14`)했다.
**zzz는 `sleepy` 전용**이다 — 생각 중에 zzz가 뜨면 상태가 혼동된다.

**⚠️ 캔버스 이식 시 주의 4가지** [추가일: 2026-09-15]

1. **`width="1.02"` 는 버린다.** SVG에서 인접 rect 사이 실선 틈을 막으려던 값이다.
   Canvas는 `fillRect(x,y,1,1)` 정수 좌표라 틈이 없고, 1.02를 옮기면 1px씩 겹쳐 경계가 지저분해진다.
2. **배율별로 따로 굽는다.** `drawImage` 확대는 비정수 스케일이 섞일 위험이 있다.
3. **패딩을 포함한 셀 크기로 굽는다.** `fx` 좌표가 16×18 경계 밖으로 나간다
   (예: `blocked` 의 `[0,7,'s']`, `done` 의 `[15,6,'H']`). 시안은 `PAD_X=5, PAD_Y=7` 로 처리했다.
4. **`scale` 앵커는 하단 중앙** (`anchorX=8, anchorY=16`) — `spawn` 이 땅에서 자라나 보이게 하는 값이다.

### 3-5. 모션 — ① 픽셀 스냅 방식 확정 ⚠️

[확정일: 2026-09-15]

**위치가 픽셀 격자에 스냅된다.** 연속 좌표 이동(모던 하이브리드)은 채택하지 않는다.

| | 채택한 ① 픽셀 스냅 | 기각한 ② 연속 좌표 |
|---|---|---|
| 감성 | 아케이드. 브랜드와 일치 | 요즘 픽셀아트 게임 |
| 구현 | 프레임 테이블 = **데이터** | 이징·반경을 **눈으로 튜닝** |
| 성능 | 정수 위치 → blit만 | `devicePixelRatio` 반올림 필요 |

> **채택 근거**: 브랜드 일치 + 프레임 테이블이 데이터라 시각 확인 왕복 없이 설계 가능 + 성능.

**프레임 테이블 — 시안 수령 완료** [확정일: 2026-09-15]

```js
// 원본: Geurus_모션_시스템.html 의 MOTION 상수
idle:{ loop:true, expr:'idle', frames:[
  {pose:'stand',dx:0,dy:0,ms:200},
  {pose:'stand',dx:0,dy:-1,ms:120},
  {pose:'stand',dx:0,dy:-2,ms:100},
  {pose:'stand',dx:0,dy:-3,ms:180},   // 정점에서 길게 머물러 ease-in-out처럼 읽힘
  {pose:'stand',dx:0,dy:-2,ms:100},
  {pose:'stand',dx:0,dy:-1,ms:120},
  {pose:'stand',dx:0,dy:0,ms:200},
  {pose:'stand',dx:0,dy:0,ms:160,expr:'blink'},
]},
```

**프레임 필드**: `pose` · `dx`/`dy`(스프라이트 픽셀 정수) · `ms` · `expr`(프레임 한정) · `fx` · `scale` · `flip`
**모션 필드**: `loop` · `next`(1회 재생 후 전이) · `expr`(기본 표정)

- 이징은 **프레임 유지 시간**으로 표현. 더 부드럽게 하려면 **프레임을 늘린다** (구조 변경 불필요)
- 회전·비정수 배율은 **영구 금지**

**설계 의도 (시안에서 확인된 것)**

- `blocked` — 좌우 흔들림 후 **420ms 정지**. 계속 흔들면 산만하므로 쉬었다 흔들어 시선만 끈다
- `spawn` — ×1 → ×2 → ×3 배율 구간마다 squash→stretch로 튕김. 단순 확대가 아니라 **성장**으로 읽힘
- `tool` — `lean` 좌우 이동, 끝점 170ms 체류 후 `flip` 으로 방향 전환
- `done` — 최고점 `dy:-5`, 1회 재생 후 `idle` 전이

### 3-6. 상태 ↔ 표정·모션 매핑

| 상태 | 포즈 + 표정 | 움직임 |
|---|---|---|
| spawn | squash → stretch, `happy` | **×1 → ×2 → ×3 정수 배율로 자라남** |
| working | stand, `think` | 빠른 bob + 잎 살랑 |
| tool 실행 | lean, `think` | 완만한 궤도 이동 |
| blocked (승인 대기) | stand, `conflict` | 좌우 흔들림 + 땀 픽셀 + 말풍선 |
| done (완료·미확인) | squash → stretch, `merge` | 폴짝 + 반짝 픽셀 |
| idle | stand, `idle` | 기본 bob (2.6s) + 랜덤 blink |
| 장시간 idle | stand, `sleepy` | 아주 느린 bob + zzz |

> **spawn의 정수 배율 성장이 브랜드 메시지와 일치한다** — "에이전트 하나, 그루 하나".

**표시 우선순위** (Codex Pets 모델 차용)

```
blocked(승인 대기) > 비정상 종료 > done(미확인) > working > idle
```

여러 마리가 있을 때 누구를 크게 보여주고 말풍선을 띄울지의 기준.

⚠️ **서브에이전트 타입 구분에 색을 쓸 수 없다.** 가이드가 몸통 골드·새싹 그린 고정을 명시.
→ **잎 변주(A안)로 확정**. 상세는 3-8 참조.

### 3-7. 말풍선 · 정원 패널 [확정일: 2026-09-15]

> 원본: `Geurus_화면_구성.html`

**말풍선** — 테두리는 라운드가 아니라 **픽셀 계단**으로 깎는다.

```js
const BUBBLE = {
  minW:84, maxW:208, padX:8, padY:5, border:2,
  corner:2,                                  // 계단 깊이(px) — 라운드 대신
  tail:{ size:3, dirs:['down','up','left','right'] },
  kind:{ base:{bar:null}, warning:{bar:'--c-danger'}, success:{bar:'--c-success'} },
};
```

- 배경 `--c-bg-elevated` · 테두리 `--c-border-strong` · **좌측 바로 상태 구분**
- 한글 Noto Sans KR + 숫자·툴명 IBM Plex Mono 혼용
- 꼬리는 그루 위치에 따라 선택 (아래에 있으면 `down`)
- **overflow 시 툴명을 우선 보존** — `Bash… · 40s` 가 아니라 `Bash 실행… · 40s`
- 두 줄로 흐르지 않게 **한 줄 고정**

**정원 패널** — 프로젝트 하나가 **화단 한 줄**이고 그 흙 위에 그루가 선다.

```js
const GARDEN = {
  size:{ w:360, minH:240 },        // 세로는 화단 수에 따라 가변
  bedsVisible:3,                   // 초과 프로젝트는 접힌 줄로
  slotsPerBed:5,                   // 초과 그루는 +N 배지
  priority:['blocked','crashed','done','working','idle'],
  scaleByPriority:{ blocked:3, crashed:3, done:2, working:2, idle:2 },
  grip:{ h:26, drag:true },        // 창 테두리 없음 → 유일한 손잡이
  bg:'solid',                      // 'solid' | 'clear'
};
```

- **상단 그립 바(26px)가 유일한 드래그 손잡이** — 창 테두리가 없기 때문
- 승인 대기·비정상 종료는 **×3 배율**로 키워 우선순위를 시각화

### 3-8. 타입 구분 · 빈 상태 · 트레이 [확정일: 2026-09-15]

> 원본: `Geurus_마감_세트.html`

**타입 구분 — A안(잎 변주) 채택**

```js
const AGENT_TYPE = {
  frontend:{ leaf:'pair',   badge:'◆' },   // 기본 두 잎
  explore: { leaf:'triple', badge:'◇' },   // 세 잎이 부채처럼
  backend: { leaf:'stem',   badge:'▣' },   // 잎 없이 줄기만
  test:    { leaf:'bud',    badge:'◈' },   // 봉오리 한 개
};
```

- 몸통 골드·새싹 그린 고정 제약 때문에 **색으로 구분할 수 없다**
- 새싹은 그루의 정체성이라 변주 여지가 가장 큼 → 잎으로 구분
- 보조 안전장치: 말풍선 첫 조각에 타입명 노출 — `explore · Grep 중 · 8s`

**`LEAF` 스파스 패치 레이어** ⚠️ 구조 핵심 [확정일: 2026-09-15]

POSE 복제(4×4=16그리드)를 피하기 위해, **EXPR이 행 8~11을 덮듯 LEAF는 행 1~3을 덮는다.**
`.` = 지우기, `L`/`l` = 잎 픽셀. 줄기·몸통·표정은 건드리지 않는다.

```js
const LEAF = {
  pair:   {},                                   // 기본 (덮지 않음)
  triple: {"1,5":".","1,10":".","2,6":".","2,9":".","2,8":"L","3,7":"L","3,8":"l"},
  stem:   { /* 잎 픽셀 전부 "." 로 삭제 → 줄기만 */ },
  bud:    { /* 삭제 + 봉오리 추가를 한 패치에서 */ },
};
```

**포즈 보정은 `LEAF_OFFSET` 4줄로 처리한다** — LEAF를 포즈별로 나누지 않는다.

```js
const LEAF_OFFSET = {
  stand:  {dr: 0, dc:0, spread: 0},
  squash: {dr: 1, dc:0, spread: 2},   // 아래 1 · 좌우로 벌림
  stretch:{dr:-1, dc:0, spread:-1},   // 위 1 · 안으로 모임
  lean:   {dr: 0, dc:1, spread: 0},   // 오른쪽 1
};

function leafCoord(r, c, off) {
  const side = c < 7.5 ? -1 : 1;              // 중심선 기준 좌우 판별
  return [r + off.dr, c + off.dc + side*off.spread];
}
```

> **`spread`의 부호 트릭이 핵심.** 중심선(7.5) 왼쪽 픽셀은 더 왼쪽으로, 오른쪽 픽셀은 더 오른쪽으로 밀어
> **벌어짐과 모임을 값 하나로** 표현한다. LEAF 4종 + OFFSET 4줄로 16조합이 성립.

- `leafFor(scale, leafKey)` — **16px 미만에서는 `pair`로 강제 폴백** (판독 불가하므로)

**기각된 2안** (재검토 방지)

| 안 | 기각 사유 |
|---|---|
| B · 발밑 배지 | ×2에서 8px 글리프가 뭉개짐 + 그루 실루엣 밖 요소라 정원이 산만해짐. **A와 병행해 툴팁 대체로만** |
| C · 배율 차등 | ⚠️ **배율 축은 이미 우선순위(승인 대기 ×3)가 점유**. 타입과 겸용하면 "큰 그루"가 두 의미를 가짐. `spawnDepth` 전용으로만 |

**트레이 아이콘**

```js
const TRAY = {
  idle:    { glyph:'sprout',       title:null },
  working: { glyph:'sprout-tall',  title:'3' },
  blocked: { glyph:'sprout-alert', title:'!1', blink:true },
};
```

- 16px에 그루 전체는 좁아 **새싹 축약형**(두 잎 + 줄기)만 사용
- **macOS 템플릿 이미지**(검정 + 투명) → 라이트·다크 자동 반전. **색 금지**
- 카운트는 아이콘이 아니라 **옆 타이틀**이 담당
- `blocked` 만 1.2s 간격 깜빡임, 나머지는 정적

**빈 상태 · 에러**

| 상황 | 표정 | 카피 방향 |
|---|---|---|
| 에이전트 없음 | `sleepy` | GitGrove 선례 계승 — *"아직 커밋이 없어요 / 첫 커밋을 심으면 그루가 자라요"* |
| Claude Code 미실행 | `sleepy` | 다음 행동 제안 |
| 로그 읽기 실패 | `conflict` | 사유 먼저, 코드 뒤 |

### 3-9. 말풍선 카피 규칙

> 근거: `GitGrove_라이팅_가이드.html`

**대원칙: "상태는 그루가 표정으로."** 글은 사실만 짧게 받친다.

```
Bash 실행 중 · 40s
승인이 필요해요 · 3 files
완료 · 2m 15s
인증이 필요해요 · 401
```

- 해요체, 한국어 먼저, 짧게. 주어(당신·제가) 생략
- 상태 조각은 쉼표·파이프가 아니라 **가운뎃점 `·`** 으로 연결
- 숫자는 서양 숫자, 99 넘으면 `99+`
- 에러는 **사유 먼저, 코드는 뒤**
- ✗ 느낌표 남발, "최고의"·"지금 바로", 장식용 이모지, 과장 형용사
- ✗ "앗! 충돌이 발생했어요" → ✓ "충돌 발생 · 3 files"

### 3-10. Herdr 연동 (선택, 마일스톤 5)

- 오버레이는 pane 밖에서 돌아 `HERDR_ENV=1`이 주입되지 않음
- **기본 소켓에 직접 접속**: `~/.config/herdr/herdr.sock`
- `session.snapshot` 으로 워크스페이스·pane 구조 확보 → 그루 클릭 시 해당 pane 포커스
- Herdr가 없으면 이 기능만 비활성. 앱 자체는 정상 동작

### 3-11. 접근성

- OS **동작 줄이기(prefers-reduced-motion)** 설정 존중 → 애니메이션 정지, 정지 프레임 사용
- Codex Pets도 동일하게 처리한다 (선례)

### 3-12. 미확인 — 착수 전 확인 권장

- **서브에이전트 JSONL 실시간 flush 여부** ⚠️ 이게 안 되면 실시간 모니터링이 성립하지 않음
  ```bash
  tail -f ~/.claude/projects/*/*/subagents/agent-*.jsonl
  ```
- 실패·취소 시 `status` / `<status>` 실제 값
- `spawnDepth >= 2`(중첩 spawn)의 파일 배치
- 멀티 모니터에서 오버레이 배치 정책
- 코드사인·공증 필요 여부 (배포 시)

---

## 4. 브랜드 자산 (GitGrove 공유)

> 원본 파일: `GitGrove_Character.html`, `GitGrove_라이팅_가이드.html`, `GitGrove_알림창.html`, `GitGrove_Geuru_UI.html`, `GitGrove_앱아이콘.png`
> **원본이 정본이다. 본 절은 요약이며, 충돌 시 원본을 따른다.**

### 4-1. 캐릭터 — 그루 (Geuru)

- 씨앗 몸통에 새싹이 돋은 정령. 머리 위 두 잎 = 브랜치, 발밑 뿌리 = 로컬 저장소
- 태그라인: **"커밋 하나, 새싹 하나."**
- 기본 크기 **16 × 18 px**
- 외곽선 없이 **명암만으로 입체**

**팔레트**

| 키 | HEX | 용도 |
|---|---|---|
| `G` | `#e6a536` | 골드 본체 |
| `D` | `#c98a22` | 음영 |
| `H` | `#ffd770` | 하이라이트 |
| `L` | `#6fcf7c` | 잎 |
| `l` | `#3f9550` | 짙은 잎 / 줄기 |
| `E` | `#10182b` | 눈 (네이비) |
| `W` | `#f4ecd2` | 눈 반짝임 |
| `k` | `#ff9b6b` | 볼 터치 |
| `b` | `#8a5a1e` | 뿌리 발 |
| `m` | `#7a4412` | 입 |
| `s` | `#5fb8e6` | 땀 / 반짝 |
| `z` | `#9fb0d8` | zzz |

**표정 6종** — 눈·입 픽셀만 교체하는 패치 방식

`idle`(기본) · `happy`(반가워) · `think`(생각중) · `merge`(머지 완료) · `conflict`(충돌) · `sleepy`(졸려) · `blink`(깜빡)

**Do / Don't** ⚠️

| ✓ Do | ✗ Don't |
|---|---|
| **정수배(×N) 확대만** | 보간 확대 · 기울임 · **회전** |
| 다크 · 그리드 배경 위 | 흐리게(blur) |
| 16px 미만은 새싹·볼터치 생략 미니 버전 | **몸통 골드·새싹 그린 임의 변경** |

### 4-2. 디자인 토큰 (아케이드 다크)

```
--c-bg-deep:#0d1220   --c-bg-surface:#161d30   --c-bg-elevated:#1f273e
--c-border:#2d3551    --c-divider:#232a44
--c-gold-200:#ffd770  --c-gold-400:#e6a536     --c-gold-500:#c98a22
--c-success:#6fcf7c   --c-info:#5fb8e6         --c-danger:#ff6b6b
--c-text:#b8c0d8      --c-text-strong:#f4ecd2  --c-text-muted:#6d7798

font-px   : 'Pixelify Sans', 'DotGothic16', monospace   ← 제목·캐릭터 UI
font-mono : 'IBM Plex Mono', monospace                  ← 수치·경로
font-body : 'Noto Sans KR', sans-serif                  ← 본문
```

- **단일 골드 액센트 원칙.** 의미가 강한 곳(성공·충돌)만 시맨틱 색을 빌린다

### 4-3. 보이스

네 가지 원칙: ① 한국어 먼저, 짧게 ② 따뜻하지만 호들갑 없이 ③ 상태는 그루가 표정으로 ④ 가운뎃점으로 잇기

> *"무엇을 쓸지 망설여지면, 그루라면 어떻게 말할지 떠올려요."*

---

## 5. 실행 환경 (실측)

| 항목 | 값 |
|---|---|
| OS | macOS |
| 주 사용 에이전트 | **Claude Code** (2.1.220 기록 확인) |
| 터미널 | Apple Terminal / `TERM=xterm-256color` — Ctrl+클릭 정상 |
| Herdr | **0.8.0 (stable), protocol 19** / running. 세션 `default` |
| Herdr 소켓 | `~/.config/herdr/herdr.sock` |
| Herdr state | `~/.local/state/herdr/` |
| Claude integration | **claude: current (v7)** — 세션 ID 보고 전용(상태 감지 아님) |
| Claude config | `~/.claude/` (백업: `settings.json.bak`) |
| 셸 | zsh + conda `base` 자동 활성화 |
| 서브에이전트 정의 | `~/Documents/GitHub/my-agents` → 프로젝트별 심볼릭 링크 |

> `~/.claude/settings.json`은 일반 파일이며 심볼릭 링크가 아님 → 훅 설치로 인한 git 오염 없음 ✅

**Herdr 참고 사실 (연동 시 필요)**

- Claude Code는 **screen manifest 감지** 방식이라 `blocked` 판정이 화면 추론 → 지연 가능
- 감지 이상 시 `herdr agent explain <target>` 이 유일한 신뢰 근거 (원격 매니페스트 자동 갱신됨)
- 탐색 시 bare `herdr` 금지(TUI 실행), `herdr workspace create` 는 인자 없이도 **실제 실행됨**

---

## 6. 외부 도구 조사 (재조사 방지)

| 도구 | 형태 | 서브에이전트 | 비고 |
|---|---|---|---|
| **Codex Pets** | 데스크톱 오버레이 | ❌ (1마리 종합) | 상태 4종(Running/Needs input/Ready/Blocked) + 우선순위 규칙. 스프라이트 1536×1872 (8열×9행). iTerm2/Kitty/Sixel 터미널만 CLI 지원 |
| **aiwatch** | Rust TUI | ✅ | 트리에 타입·상태·소요시간·툴명. 컨텍스트 사용률 표시. ⚠️ README가 `Task` 기준이라 현재 동작 의심 |
| **Pixel Agents** | 브라우저 | ✅ | 서브에이전트를 별도 캐릭터로. 훅 + JSONL 폴백 |
| **AgentRoom** | Tauri 데스크톱 | — | 말풍선·사운드·토큰 대시보드 |
| **c9watch** | macOS 메뉴바 | ❌ | OS 프로세스 스캔이라 훅 미설치 |

⚠️ **훅 충돌**: `~/.claude/settings.json`에 훅을 추가하는 도구가 다수. Herdr 훅이 이미 있음.
**Geurus는 설계상 훅을 쓰지 않는다** (JSONL 워처 방식).

---

## 7. 코드 규약 및 저장소

| 항목 | 값 |
|---|---|
| 저장소 | **`github.com/sdf5771/geurus`** |
| **런타임** | **Electron 30+** [확정일: 2026-09-15] |
| **UI** | **React 18 + TypeScript 5 + Vite 5** (GitGrove 준거) |
| **스프라이트 렌더** | **Canvas 2D + 부팅 시 래스터화** — DOM/SVG 매 프레임 재생성 금지 |
| **말풍선** | **DOM (캔버스 위 절대배치)** — 한글 폰트 폴백·줄바꿈 때문 |
| **파일 감시** | **chokidar** (main 프로세스) — macOS `fs.watch` 재귀 감시 불안정 |
| **IPC** | **contextBridge + preload** — 렌더러에 Node 비노출 |
| **상태 관리** | **Zustand** — 단일 창이라 경량으로 충분 |
| **패키징** | **electron-builder** (dmg, arm64 + x64). 공증은 배포 결정 후 |
| 디자인 토큰 | CSS custom properties, GitGrove와 동일 키 |
| Prettier | 사용자 preferences 기준 준수 |
| 커밋 / 브랜치 | *미확정* |

> ⚠️ **Pixelify Sans는 한글 미지원.** 한글은 반드시 Noto Sans KR로.

**PR 작성 규칙** (사용자 전역 규칙)
1. `.github/pull_request_template.md` 를 **먼저 읽는다**
2. target/base 브랜치를 **반드시 사용자에게 묻는다**
3. 현재 브랜치와 target을 git으로 비교해 전체 변경·커밋 메시지 파악
4. 템플릿 구조에 맞춰 작성하고 **전체를 마크다운 코드블록으로 감싼다**
5. `gh pr create` 로 **자동 생성하지 않는다** — 본문 텍스트만 제공

---

## 8. 미결 / 리스크

### 8-1. 사용자 확인 대기

| 항목 | 비고 |
|---|---|
| 공개 배포 여부 | 코드사인·공증 판단에 영향 |
| 디자인 시스템 공유 방식 | npm 패키지 / 서브모듈 / 수동 복사 |

### 8-2. 기술적 확인 필요

- ~~서브에이전트 JSONL 실시간 flush 여부~~ → ✅ **검증 완료** [2026-09-15]
  `tail -F` 로 관측 시 서브에이전트 실행 **도중에 줄이 계속 추가됨**.
  버퍼링 없음 → **읽기 전용(워처) 설계 확정**, 훅 방식 불필요
- ~~잎 변주 그리드~~ → **LEAF 패치 레이어로 수령 완료, 종결** [2026-09-15]
- 실패·취소 시 `status` 실제 값
- `spawnDepth >= 2` 파일 배치
- 멀티 모니터·풀스크린 앱 위에서의 오버레이 동작
- **aiwatch의 `Agent` 툴명 대응 여부** — Geurus 존재 가치 검증

### 8-3. 알려진 리스크

- **Claude Code 스키마 드리프트** — `Task` → `Agent` 전례 있음. `version` 필드로 분기 판단
- **JSONL 폴링 지연** — 수백 ms. 밀리초 트리거가 필요한 설계 불가
- **오버레이 배터리 소모** — 유휴 시 프레임률 강제 하향 필요
- **브랜드 자산 분기** — GitGrove와 별도 저장소라 그루 스펙이 어긋날 수 있음. 공유 방식 결정 필요
- **타입 구분 수단 부족** — 색 변경 금지 제약

---

## 9. 참조 현황

| 자료 | 상태 |
|---|---|
| `claude-code-transcript-schema.md` | ✅ 실측 완료 |
| `Geurus_모션_시스템.html` | ✅ **POSE 4종 · MOTION 7종 확정** (산출물 ①②) |
| `Geurus_화면_구성.html` | ✅ **BUBBLE · GARDEN 확정** (산출물 ③④) |
| `Geurus_마감_세트.html` | ✅ **AGENT_TYPE · LEAF · TRAY · 빈 상태 확정** (산출물 ⑤⑥⑦). 디자인 완결 |
| `GEURUS_DESIGN_BRIEF.md` | ✅ 발주서 |
| `GitGrove_Character.html` | ✅ 팔레트·표정·Do/Don't 확인 |
| `GitGrove_라이팅_가이드.html` | ✅ 보이스 4원칙·마이크로카피 확인 |
| `GitGrove_알림창.html` | ✅ 표정↔상태 매핑 선례 확인 |
| `GitGrove_Geuru_UI.html` | ❌ 미확인 (634줄) |
| `GitGrove_앱아이콘.png` | ❌ 미확인 |
| herdr docs 0.8.0 | ✅ overview/quick-start/concepts/agents/socket-api/plugins/integrations/agent-skill |
| 〃 나머지 페이지 | ❌ (install, config, CLI reference, session-state 등) |

---

## 10. 명령어 치트시트

```bash
# ─── 데이터 확인 ───
ls ~/.claude/projects/*/*/subagents/*.meta.json
grep -l '"name":"Agent"' ~/.claude/projects/*/*.jsonl | head -5
tail -f ~/.claude/projects/*/*/subagents/agent-*.jsonl   # flush 확인

jq -r 'select(.type=="assistant")|.message.content[]?
        |select(.type=="tool_use")|.name' agent-<id>.jsonl

# ─── Herdr (연동 시) ───
herdr status
herdr agent explain <target>
herdr api snapshot
herdr api schema --json

# ─── 참고 도구 ───
cargo install aiwatch            # 비교 대상
npx pixel-agents --no-terminal   # 브라우저 시각화 선례
```

---

## 11. 변경 이력

| 일자 | 버전 | 내용 |
|---|---|---|
| 2026-09-15 | **v2.5** | 저장소 확정 — `github.com/sdf5771/geurus` |
| 2026-09-15 | v2.4 | **최대 리스크 해소 — 서브에이전트 JSONL 실시간 flush 검증 완료.** 실행 도중 줄이 계속 추가되며 버퍼링 없음. **읽기 전용 워처 설계 확정**(훅 불필요 → `settings.json` 미수정 → Herdr·타 도구와 충돌 없음). 디렉터리 감시 필요성(`tail -F` / chokidar `add`) 기록 |
| 2026-09-15 | v2.3 | **디자인 완결.** `LEAF` 스파스 패치 레이어 수령 — POSE 복제(16그리드) 대신 **행 1~3 패치 + `LEAF_OFFSET` 4줄**로 해결. `spread` 부호 트릭(중심선 기준 좌우 판별)으로 squash 벌어짐·stretch 모임을 값 하나로 표현. 스프라이트 구조를 **4중 레이어**(POSE→LEAF→EXPR→fx)로 정리, 래스터화 조합을 288장으로 갱신. B(발밑 배지)·C(배율 차등) 기각 사유 기록 — 특히 C는 **배율 축이 우선순위와 충돌**. zzz를 `think`에서 `sleepy`로 이동 |
| 2026-09-15 | v2.2 | **디자인 시안 3종 수령·반영.** `POSE` 4종(stand/squash/stretch/lean)과 `MOTION` 7종 프레임 테이블 확정, 시안 측이 추가한 **`fx` 오버레이 레이어 채택**. `BUBBLE`·`GARDEN`·`AGENT_TYPE`·`TRAY` 상수 확정. 타입 구분은 **잎 변주(A안)** 채택. 캔버스 이식 주의 4가지(`1.02` 제거·배율별 굽기·패딩 포함·하단 중앙 앵커) 기록. 잎 그리드 3종은 **LEAF 패치 레이어로 재발주 예정** |
| 2026-09-15 | v2.1 | **기술 스택 확정** — Electron 30+ / React 18 / Canvas 2D 래스터화 / DOM 말풍선 / chokidar / Zustand / electron-builder. **형태를 「정원 패널 우선」으로 확정**(전체 화면 로밍은 2단계 보류). 클릭 통과 ↔ 상호작용 전환 패턴 명시, 트레이 아이콘을 1단계 필수로 편입. 디자인 발주서 `GEURUS_DESIGN_BRIEF.md` 작성 |
| 2026-09-15 | v2.0 | **기획 전환 및 개명 — `YANGBONGJANG` → `GEURUS`.** 터미널 TUI에서 **Electron 데스크톱 오버레이**로 전환, 벌 은유 폐기하고 **GitGrove 마스코트 「그루」 채택**. 별도 저장소 + 디자인 시스템 공유 확정. 모션은 **① 픽셀 스냅 + 프레임 테이블** 방식 확정. 브랜드 자산 4절 신설. 상태↔표정 매핑 및 표시 우선순위 확정 |
| — | v1.0 | `HERDR` → `YANGBONGJANG` 개명. 서브에이전트 시각화 TUI로 주제 전환. JSONL 스키마 실측 반영 |
| — | v0.8 | 플러그인 아이디어 백로그 등록. standalone 우선 방침 |
| — | v0.7 | `herdr --skill` 실측 — CLI 실무 규칙·함정 2종 |
| — | v0.6 | Apple Terminal Ctrl+클릭 정상 동작 확인 (추정 정정) |
| — | v0.5 | `herdr agent explain` 실측 |
| — | v0.4 | Claude Code integration v7 설치 |
| — | v0.1~v0.3 | Herdr 도입·환경 실측 |
