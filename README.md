# Geurus

> 에이전트 하나, 그루 하나.

Watch your Claude Code subagents work. A macOS desktop overlay where each subagent grows as a pixel sprite.

Claude Code의 서브에이전트를 캐릭터 「그루」로 데스크톱 위에 띄우는 macOS 오버레이 앱이에요.
몇 개가 돌고 있는지, 무엇을 하는지, 무엇이 승인을 기다리는지 한눈에 보여줘요.

## 특징

- **서브에이전트마다 그루 한 마리** — 세션 전체를 한 마리로 뭉뚱그리지 않아요
- **정원 패널** — 프로젝트 하나가 화단 한 줄, 그 위에 그루가 서요
- **상태는 표정으로** — 작업 중·툴 실행·승인 대기·완료·유휴를 포즈와 표정으로 전해요
- **읽기 전용** — `~/.claude/` 트랜스크립트를 읽기만 해요. 훅을 설치하지 않고 `settings.json`도 건드리지 않아요

## 상태

1단계(오버레이 셸)를 구현하고 있어요. 지금은 투명 창에 정지한 그루 한 마리와 메뉴바 새싹 아이콘이 떠요. 서브에이전트 데이터는 아직 읽지 않아요.

| # | 단계 | 상태 |
|---|---|---|
| 0 | 사전 조사 | ✅ |
| 0.5 | 디자인 시안 | ✅ |
| 1 | 오버레이 셸 — 투명·항상 위·클릭 통과 창, 트레이 아이콘 | 🔄 |
| 2 | 데이터 레이어 — JSONL 워처 | ⬜ |
| 3 | 모션 시스템 | ⬜ |
| 4 | 말풍선 · 정원 패널 | ⬜ |
| 5 | 배포 | ⬜ |

## 기술 스택

| 영역 | 선택 |
|---|---|
| 런타임 | Electron 30+ |
| UI | React 18 · TypeScript 5 · Vite 5 |
| 상태 관리 | Zustand |
| 스프라이트 | Canvas 2D (부팅 시 래스터화) |
| 파일 감시 | chokidar |
| 패키징 | electron-builder (dmg, arm64 + x64) |

## 개발

macOS와 Node.js가 필요해요.

```bash
npm install
npm run dev          # 개발 실행 (Vite + Electron)
npm run build        # 타입 검사 + 빌드
npm start            # 빌드 결과 실행
npm test             # 단위 테스트
```

| 명령 | 설명 |
|---|---|
| `GEURUS_DEVTOOLS=1 npm run dev` | DevTools를 별도 창으로 열어요. 앱 메뉴가 없어서 단축키로는 열리지 않아요 |
| `npm run typecheck` | 렌더러와 main 프로세스 타입 검사 |
| `npm run snapshot:check` | 스프라이트 데이터가 `docs/design` 원본과 같은지 확인 |

- 오버레이는 주 디스플레이 오른쪽 아래에 떠요. 종료는 메뉴바 새싹 아이콘의 `종료`로 해요
- 빌드 실행(`npm start`)은 한 번에 하나만 떠요. 개발 실행은 잠금이 없어서 빌드와 함께 띄우면 그루가 두 마리가 돼요
- 수동 테스트 항목은 [`docs/qa/M1_MANUAL_CHECKLIST.md`](docs/qa/M1_MANUAL_CHECKLIST.md)에 있어요

## 문서

| 문서 | 내용 |
|---|---|
| [`docs/GEURUS_PROJECT_CONTEXT.md`](docs/GEURUS_PROJECT_CONTEXT.md) | 프로젝트 정본 — 설계·판정 로직·브랜드·미결 사항 |
| [`docs/GEURUS_PM_BRIEF.md`](docs/GEURUS_PM_BRIEF.md) | 개발 진행 지시서 — 역할 경계·하드 룰·마일스톤 |
| [`docs/GEURUS_DESIGN_BRIEF.md`](docs/GEURUS_DESIGN_BRIEF.md) | 디자인 발주서 |
| [`docs/design/`](docs/design) | 디자인 원본 — 모션·화면 구성·마감 세트·캐릭터·라이팅 가이드 |
| [`docs/transcript-schema.md`](docs/transcript-schema.md) | Claude Code 트랜스크립트 실측 스키마 |
| [`agent-log.md`](agent-log.md) | 작업 진행 로그 (인덱스 → `agent-log/`) |

## 관련 프로젝트

- [GitGrove](https://github.com/sdf5771/gitgrove) — 그루의 원래 집. 캐릭터와 디자인 시스템을 공유해요
