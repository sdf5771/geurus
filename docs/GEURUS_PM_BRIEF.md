# Geurus — PM 지시서

> 프로젝트 루트 `CLAUDE.md`(PM)가 로드된 상태에서 이 문서를 전달한다.
> 저장소에 둘 경우 권장 경로: `docs/PM_BRIEF.md`

---

## 1. 프로젝트

**Geurus** — Claude Code의 서브에이전트를 캐릭터 「그루」로 데스크톱에 띄우는 macOS 오버레이 앱.
서브에이전트가 몇 개 돌고, 무엇을 하고, 무엇이 내 승인을 기다리는지를 한눈에 보여준다.

- 저장소: `github.com/sdf5771/geurus`
- 형제 프로젝트: `github.com/sdf5771/gitgrove` — 캐릭터·디자인 시스템 공유
- 슬로건: **"에이전트 하나, 그루 하나."**

## 2. 단일 진실 공급원 ⚠️ 먼저 읽을 것

작업 시작 전 **반드시** 아래를 읽고 `agent-log.md`에 배치·스택·확정 사항을 옮겨 적는다.

| 문서 | 내용 |
|---|---|
| `GEURUS_PROJECT_CONTEXT.md` | **정본.** 스택·설계·브랜드·판정 로직·미결 전부 |
| `docs/transcript-schema.md` | JSONL 실측 스키마 |
| `docs/design/motion-system.html` | `POSE` 4종 · `MOTION` 7종 (데이터 원본). ⚠️ `EXPR`은 **옛 버전**(think에 zzz) |
| `docs/design/screen-layout.html` | `BUBBLE` · `GARDEN` |
| `docs/design/finishing-set.html` | `LEAF` · `LEAF_OFFSET` · `AGENT_TYPE` · `TRAY` · `EXPR` **최신 5종** |
| `docs/design/character.html` | 팔레트 · 표정 · Do/Don't |
| `docs/design/writing-guide.html` | **라이팅 가이드 — 노출 텍스트 검수 기준** |
| `agent-log.md` → `agent-log/` | 진행 상태·확정 계약·이력 (인덱스부터 읽는다) |

> **EXPR은 키별로 원본이 다르다** — `think`·`sleepy`는 `finishing-set`(zzz는 sleepy 전용), `blink`·`merge`는 `motion-system`, 나머지는 두 파일이 동일. 상세는 `agent-log/design.md`

> 이 문서들과 충돌하는 판단이 필요하면 **추측하지 말고 사용자에게 확인**한다.
> 특히 브랜드 자산은 HTML 원본이 정본이며, 컨텍스트 문서의 요약은 참조용이다.

## 3. 배치된 에이전트

**상시** — `product-planner` · `frontend` · `backend` · `web-design` · `qa` · `review` · `vision`
**필요 시 호출** — `researcher` · `ai-engineer`
**배포 단계 추가 예정** — `infra`

그 외 에이전트는 이 프로젝트에 배치하지 않는다. **미배치 영역 작업이 필요하면 사용자에게 먼저 알린다.**

### 3-1. product-planner 투입 기준 ⚠️

이미 확정된 범위는 **재논의 대상이 아니다.** `GEURUS_PROJECT_CONTEXT.md` 의 마일스톤·설계·브랜드는 사용자가 확정한 것이며, product-planner가 다시 열지 않는다.

| 투입한다 | 투입하지 않는다 |
|---|---|
| 신규 기능 아이디어가 나왔을 때 (범위·우선순위 판단) | 이미 문서에 있는 마일스톤 실행 |
| 기능이 늘어나 MVP 범위를 잘라야 할 때 | 확정된 설계의 재검토 |
| "이것도 넣을까?" 류의 판단이 필요할 때 | 단순 구현·버그 수정 |

PM은 기획 판단(범위 컷·우선순위)을 스스로 내리지 말고 product-planner에 위임하되,
**product-planner가 낸 질문·방향 안·제외 항목은 대신 답하지 말고 사용자에게 그대로 전달**한다.

### 3-2. researcher 투입 기준

조사·검증 전용이며 **구현하지 않는다.** 이 프로젝트에서 예상되는 용도:

- Electron API 실제 동작 확인 (투명창·클릭 통과·멀티 Space·풀스크린 위 표시)
- **Claude Code 트랜스크립트 스키마 변경 추적** — `Task` → `Agent` 전례가 있다
- macOS 코드사인·공증 절차, 트레이 템플릿 이미지 규격
- 경쟁·참고 도구 동작 확인 (aiwatch, Pixel Agents, Codex Pets)

결론에는 **근거 등급(확인됨/주장됨/추정)과 확인 날짜**를 요구한다.
PM은 "추정" 항목을 확정처럼 다루지 않으며, 사용자에게 보고할 때 등급을 함께 전달한다.

### 3-3. ai-engineer

현재 Geurus는 **LLM을 호출하지 않는다.** Claude Code를 관찰만 한다.
따라서 지금은 위임할 작업이 없다. 향후 LLM 기능(예: 서브에이전트 활동 요약, 자연어 질의)이
제품 범위에 들어오면 그때 투입한다. **조사·비교는 researcher 소관이지 ai-engineer가 아니다.**

## 4. 기술 스택 (확정 — 임의 변경 금지)

| 영역 | 확정 | 비고 |
|---|---|---|
| 런타임 | **Electron 30+** | GitGrove와 동일 |
| UI | **React 18** | |
| 언어 | **TypeScript 5** | |
| 번들러 | **Vite 5** | webpack 아님 |
| 상태 관리 | **Zustand** | 단일 창이라 Redux 등 불필요 |
| 스프라이트 렌더 | **Canvas 2D** | DOM/SVG 매 프레임 재생성 금지 |
| 말풍선 | **DOM** (캔버스 위 절대배치) | 한글 폰트 폴백·줄바꿈 때문 |
| 파일 감시 | **chokidar** (main 프로세스) | macOS `fs.watch` 재귀 감시 불안정 |
| IPC | **contextBridge + preload** | 렌더러에 Node 비노출 |
| 스타일 | **CSS custom properties** | GitGrove와 동일 토큰 키 |
| 패키징 | **electron-builder** (dmg, arm64 + x64) | 공증은 배포 결정 후 |

**폰트**

```
Pixelify Sans / DotGothic16 : 영문 라벨·수치 강조
IBM Plex Mono               : 경로·시간·툴명
Noto Sans KR                : 한글 본문
```

⚠️ **Pixelify Sans는 한글을 지원하지 않는다.** 한글에 적용하면 폴백으로 깨진다.

**디자인 토큰** — GitGrove와 동일한 키를 쓴다.

```
--c-bg-deep:#0d1220   --c-bg-surface:#161d30   --c-bg-elevated:#1f273e
--c-border:#2d3551    --c-border-strong:#45506e --c-divider:#232a44
--c-gold-200:#ffd770  --c-gold-400:#e6a536     --c-gold-500:#c98a22
--c-success:#6fcf7c   --c-info:#5fb8e6         --c-danger:#ff6b6b
--c-text:#b8c0d8      --c-text-strong:#f4ecd2  --c-text-muted:#6d7798
```

- **단일 골드 액센트 원칙.** 의미가 강한 곳(성공·충돌)만 시맨틱 색을 빌린다
- 스택 변경이 필요하다고 판단되면 **사용자에게 먼저 보고**한다. 임의 교체·추가 금지
- 의존성 추가는 최소한으로. 스프라이트·애니메이션 관련 라이브러리는 **쓰지 않는다** (직접 구현이 확정 방침)

## 5. 역할 경계 — Electron 특수 규칙 ⚠️

이 프로젝트에는 서버가 없다. 통상적인 frontend/backend 구분이 그대로 적용되지 않으므로 아래로 고정한다.

| 영역 | 담당 | 범위 |
|---|---|---|
| `electron/main.ts`, `preload.ts` | **backend** | 창 생성·트레이·IPC 핸들러·파일 워처(chokidar)·JSONL 파싱·Herdr 소켓·앱 수명주기 |
| `src/**` (렌더러) | **frontend** | React 컴포넌트·캔버스 렌더링·스프라이트 래스터화·애니메이션 루프·상태(Zustand) |
| 신규 화면 명세 | **web-design** | 설정 창·트레이 메뉴·온보딩 등 **아직 시안이 없는 화면**만 |

- **IPC 메시지 스키마는 backend와 frontend가 먼저 합의**한다. PM이 조율한다.
- 스프라이트 데이터(`POSE`/`LEAF`/`EXPR`/`MOTION`)는 **frontend 소관**이지만 **재설계 대상이 아니다.**
  HTML 원본에서 이식만 한다.

## 6. 절대 규칙 (하드 룰)

위반은 `vision`이 감사하고, PM은 머지 전 확인한다.

### 6-1. 브랜드 — 그루 스프라이트

- **정수배(×N) 확대만.** 보간 확대·기울임·**회전** 금지
- **흐리게(blur) 금지**, 그림자로 뭉개지 말 것
- **몸통 골드(`#e6a536`)·새싹 그린(`#6fcf7c`) 임의 변경 금지.** 팔레트 밖 색 추가 금지
- 스쿼시·스트레치는 **CSS `scaleY`가 아니라 그리드로** 구현 (비정수 배율은 픽셀을 뭉갠다)
- 16px 미만 미니 버전은 새싹·볼터치 생략, 잎 변주도 `pair`로 폴백

### 6-2. 읽기 전용 원칙

- **`~/.claude/settings.json`을 수정하지 않는다.** Claude Code 훅을 설치하지 않는다
  (Herdr 훅이 이미 있고, 타 도구와 충돌하면 안 된다)
- `~/.claude/` 이하는 **읽기만** 한다
- JSONL 실시간 flush는 검증 완료 → 워처 방식으로 충분하다

### 6-3. 데이터 판정 (자주 틀리는 3가지)

- 서브에이전트 툴 이름은 **`Agent`** 다. `Task`가 아니다
- 서브에이전트는 **별도 파일로 분리**되어 있다. 부모 파일에 `isSidechain==true`는 없다
- **대부분 비동기 spawn이다.** `tool_result`로 완료를 판정하면 전부 즉시 완료로 오판한다
  → 비동기 완료는 부모의 `<task-notification>` 문자열로 판정
- 프로젝트 식별은 **레코드의 `cwd` 필드**로. 디렉터리명 인코딩은 역변환이 모호하다
- 파일 감시는 **디렉터리 감시**(chokidar `add`)여야 한다. 서브에이전트 파일은 작업 도중 새로 생긴다

### 6-4. 노출 텍스트

`docs/design/writing-guide.html`을 **프로젝트 라이팅 가이드로 삼는다.** (`docs/WRITING_GUIDE.md`로 옮기는 작업은 아직 하지 않았다)

- 해요체, 한국어 먼저, 짧게. 주어 생략
- 상태 조각은 **가운뎃점 `·`** 으로 연결
- 숫자는 서양 숫자, 99 초과는 `99+`
- 에러는 **사유 먼저, 코드는 뒤** — `인증이 필요해요 · 401`
- **상태는 그루가 표정으로 전하고, 글은 사실만 짧게 받친다**
- 느낌표 남발·과장 형용사·장식용 이모지 금지

```
✓ 충돌 발생 · 3 files
✗ 앗! 충돌이 발생했어요
```

⚠️ **Pixelify Sans는 한글을 지원하지 않는다.** 한글은 Noto Sans KR.

## 7. 마일스톤과 위임 순서

### 1단계 — 오버레이 셸 (현재)

**목표: 기술 리스크 제거.** 데이터·모션 없이 정지한 그루 한 마리만 띄운다.

| 순서 | 담당 | 산출물 |
|---|---|---|
| 1 | **backend** | 투명·프레임 없는·항상 위 창 / `app.dock.hide()` / 트레이 아이콘(**`종료`만** — 설정은 이후 단계) / 클릭 통과 IPC |
| 2 | **frontend** | 캔버스에 그루 1마리 정지 렌더 / 스프라이트 이식 / 히트박스 판정 |
| 3 | **qa** | 아래 검증 항목 |
| 4 | **review** → **vision** | 코드 / 브랜드 준수 |

**검증 항목 (qa)**

- 투명 배경이 실제로 비치는가 (불투명 사각형이 남지 않는가)
- 그루 밖 클릭이 **아래 앱으로 통과**되는가
- 그루 위에서는 클릭이 **잡히는가** (`setIgnoreMouseEvents(false)` 전환)
- 독 아이콘이 없고 **트레이로 종료**되는가
- 다른 Space·풀스크린 앱 위에서도 보이는가
- 픽셀이 선명한가 (Retina에서 뭉개지지 않는가)

**backend 구현 메모**

```js
win.setIgnoreMouseEvents(true, { forward: true })   // forward가 핵심
win.setAlwaysOnTop(true, 'screen-saver')
win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
```

`forward: true` 면 클릭은 통과하되 `mousemove`는 렌더러로 온다.
커서가 그루 히트박스에 들어오면 IPC로 `setIgnoreMouseEvents(false)`, 벗어나면 다시 `true`.

**frontend 구현 메모**

- 시안의 SVG `<rect width="1.02">` 는 **캔버스 이식 시 1로 바꾼다** (겹침 방지)
- 배율별로 **따로 래스터화**한다. `drawImage` 확대 금지
- `fx` 좌표가 16×18 밖으로 나가므로 **패딩 포함 셀**(`PAD_X=5, PAD_Y=7`)로 굽는다
- `scale` 앵커는 **하단 중앙**(`anchorX=8, anchorY=16`) — 땅에서 자라 보이게
- `ctx.imageSmoothingEnabled = false`

### 2단계 — 데이터 레이어

**backend** 가 워처·파서를 만들고 IPC로 서브에이전트 목록·상태를 푸시한다.
**IPC 스키마를 frontend와 먼저 합의**시킬 것.

### 3단계 — 모션 시스템

**frontend.** `MOTION` 프레임 테이블 재생, 상태 전이, 유휴 시 프레임률 하향, `prefers-reduced-motion` 존중.

### 4단계 — 말풍선 · 정원 패널

**frontend** 구현. 신규 화면(설정 창 등)이 필요하면 **web-design 선행**.

### 5단계 — 배포

**infra** 추가 배치. electron-builder, 코드사인·공증, GitHub Actions.

## 8. 성능 요구

- 전부 유휴일 때 **프레임률을 초당 2~4로 낮춘다.** 상시 60fps 금지 (배터리)
- 스프라이트는 **부팅 시 래스터화**(포즈 4 × 잎 4 × 표정 **7** × 배율 3 = **336장**)하고 이후 blit만
- `renderSprite()`를 매 프레임 호출하지 않는다 (`<rect>` 288개 생성)

## 9. 진행 규칙

- 각 단계 완료 시 `agent-log.md`에 **즉시** 기록 (세션 단절 전제)
- **머지 권한은 사용자에게 있다.** PM은 PR 생성·리뷰까지 하고 머지는 하지 않는다
- 불명확한 요구사항은 구현 전 사용자에게 확인. 특히 **브랜드·라이팅은 추측 금지**
- 컨텍스트 문서에 없는 새 사실이 확정되면 사용자에게 보고한다 (사용자가 정본을 갱신한다)

## 10. 미결 항목 (구현 중 마주치면 보고)

- 실패·취소 시 `status` 실제 값 — 표본에 `completed`만 있음.
  **화이트리스트가 아니라 블랙리스트로 처리**할 것 (`completed` 아니면 비정상 종료)
- `spawnDepth >= 2`(중첩 spawn)의 파일 배치
- 멀티 모니터·풀스크린 환경에서의 오버레이 동작

> 위 항목 중 **실측으로 확인 가능한 것은 researcher에 위임**한다.
> 단, 결론에 근거 등급과 확인 날짜를 붙이게 하고, "추정"은 확정으로 다루지 않는다.
