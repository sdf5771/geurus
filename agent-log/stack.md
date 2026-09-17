# 스택 · 의존성 · 환경 · 에이전트 배치

> 최종 갱신: 2026-09-15 · 정본: `docs/GEURUS_PROJECT_CONTEXT.md` 7절, `docs/GEURUS_PM_BRIEF.md` 4절

## 기술 스택 (확정 — 임의 변경 금지)

Electron 30+ · React 18 · TypeScript 5 · Vite 5 · Zustand · Canvas 2D(부팅 시 래스터화) · DOM 말풍선 · chokidar(main) · contextBridge+preload · CSS custom properties · electron-builder(dmg, arm64+x64)

- 스프라이트·애니메이션 라이브러리 **사용 금지**(직접 구현). 의존성 추가 최소화
- 폰트: Pixelify Sans/DotGothic16(영문·수치) · IBM Plex Mono(경로·시간·툴명) · Noto Sans KR(한글). **Pixelify Sans는 한글 미지원**
- 스택 변경이 필요하면 사용자에게 먼저 보고

## 실제 설치 버전 (1단계 기준)

| 구분 | 패키지 |
|---|---|
| dependencies | react 18.3.1 · react-dom 18.3.1 |
| devDependencies | electron 30.5.1 · vite 5.4.21 · vite-plugin-electron 0.28.8 · typescript 5.9.3 · vitest 2.1.9 · @vitejs/plugin-react 4.7.0 · @types/react · @types/react-dom · @types/node ^20 |

- `vite-plugin-electron-renderer`는 **제거함**(렌더러 Node shim이 역할 경계를 가림 — review Minor-4)
- Zustand·chokidar·electron-builder·폰트 패키지는 **아직 미설치** (필요 단계에서 추가)
- ⚠️ **Electron 30은 지원 종료**(마지막 패치 2024-09-12, EOL 2024-10-14 — 약 23개월 무패치). `npm audit` 실측은 **critical 1 · high 3 · moderate 3**(PM이 앞서 "7건, high 2"로 가볍게 요약한 것을 infra가 정정)

### Electron 업그레이드 검토 (infra, 2026-09-16) — 사용자 결정 대기

**권고: 지금(2단계 착수 전) 30.5.1 → 44.4.1.** 함께 `vite 7.3.6` · `vitest 4.1.11` · `@types/node ^24`만 올림. `vite-plugin-electron`·`@vitejs/plugin-react`·TS·React는 그대로

- **scratchpad 사본 실측**: audit **0건** · typecheck·test **240**·build·`snapshot:check` 전부 통과 · **코드/설정/테스트 수정 0건**(`package.json` 4줄 + lockfile). 30→44는 Electron API를 얇게 쓰고(`electron` import가 3파일) 순수 로직을 분리한 M1 설계 덕에 이례적으로 작음 — **미루면 이 이점이 줄어듦**
- **44를 고른 이유**: 지원 3개(42·43·44) 중 지원 기간 최장(2027-03-02). 42는 2026-10-20 EOL, 45는 5주 뒤 출시라 대기 비용이 큼
- **지금 해야 하는 핵심 근거**: 자동 테스트 240개는 Electron 업그레이드에 **신호를 0 제공**(`electron` import 테스트 없음, `environment:'node'`라 Canvas 미실행). 검증 수단은 **수동 체크리스트뿐**이고 아직 미실행 → 지금 올리면 **한 번**, 나중에 올리면 버릴 버전에 한 번 + 목표 버전에 한 번 **두 번** 태워야 함
- **위험 성격이 바뀌는 경계는 5단계가 아니라 2단계**: 지금 advisory가 안 닿는 이유는 렌더러에 외부 데이터가 없어서. 2단계에서 JSONL(모델·외부 도구가 만든 문자열)을 렌더러에 올리면 context isolation bypass 계열이 실제 경로가 됨 [추정]
- **현재 위험도**: 개발 중은 사실상 없음(vitest critical은 UI 서버 미사용이라 비해당, vite high는 Windows 전용, extract-zip은 설치 시). 배포 시엔 ASAR integrity bypass·코드사인 스푸핑 2건이 실제로 켜짐
- **추가 발견(중요)**: macOS 26에서 투명 창의 private `_cornerMask` 오버라이드가 **WindowServer GPU 상시 부하**를 유발하는 업스트림 버그(#48311, 수정 PR #48376) — **37·38에만 백포트, 30에는 영원히 안 들어옴**. 종일 띄우는 오버레이라 배터리 근거와 충돌. `hasShadow:false`라 안 탈 가능성도 있어 **미측정**[추정] → 업그레이드 전 30에서 WindowServer 기준선 측정 필요
- **깨질 위험 지점**(31~44 breaking change 대조 + Electron 44 실기동 프로브 `ALL_OK`): 문서상 걸리는 API 없음. 그래도 **재측정 필수**: ① 투명창 GPU 부하(전후 비교) ② 크래시 후 click-through 고착(electron#49982, Windows 보고뿐·macOS 미확인) ③ **`did-navigate`/`will-navigate` 이벤트 순서 — 현재 표는 30.5.1 실측값이고 복구 설계 전체가 여기 의존, Chromium 124→152라 44에서 재측정** ④ Canvas 래스터 픽셀(자동 테스트가 못 잡음 → 체크리스트 10번이 유일 방어선)
- **사전 조건**: 개발 머신 **Node 24 LTS 필요**(현재 v23.11은 홀수 라인 EOL, vitest 4 엔진 요구 불만족). npm 11.4.2 arborist 버그는 `--legacy-peer-deps`로 우회(Node 24 동반 npm에서 해소되는지 미확인)
- **GitGrove와 버전 맞출 필요 없음**(공유는 캐릭터·디자인 토큰뿐). "Electron 30+"라 스택 변경 아님. 단 정본·stack.md의 "GitGrove와 동일" 문구는 갱신 필요. 참고: GitGrove는 배포 중이며 외부 텍스트를 렌더링해 **advisory가 실제로 닿음 → 별건으로 우선 검토 권고**
- **롤백**: 코드 변경이 없어 `package.json`·lockfile revert + `npm ci`로 완전 복귀
- 미확인: cornerMask 실제 영향 · 44 이벤트 순서 · OS 레벨 실동작 · Chromium 152 Canvas 픽셀 동일성 · #49982 macOS 재현 · Node 24 npm 버그 · electron-builder 호환(5단계)

## 명령

| 명령 | 용도 |
|---|---|
| `npm run dev` | Vite + Electron (dev 서버 모드, 단일 인스턴스 잠금 없음) |
| `GEURUS_DEVTOOLS=1 npm run dev` | DevTools를 분리 창·비활성으로 자동 오픈 (앱 메뉴가 없어 ⌥⌘I 불가) |
| `npm run build` | typecheck + vite build (electron-builder 없음 — 5단계) |
| `npm start` | 빌드 산출물 실행 (`electron .`) |
| `npm test` | vitest (node 환경, jsdom 없음) |
| `npm run typecheck` | `tsconfig.json`(렌더러) + `tsconfig.node.json`(main·설정) |
| `npm run snapshot:check` | `docs/design/*.html` 원본과 스프라이트 fixture 대조 |

## 빌드 구성

- `vite-plugin-electron/simple` — main `electron/main.ts`, preload `electron/preload.ts` → **`dist-electron/preload.cjs`** 고정(sandbox preload는 CJS 필요)
- `base: './'` — 빌드 `dist/index.html`이 `./assets/...` 참조(loadFile 호환)
- 빌드 전용 CSP 플러그인 — 상세는 [architecture.md](architecture.md)
- 참고 선례: 로컬 `../gitgrove` (같은 스택)

## 실행 환경 (qa 실측)

- macOS 26.5.1 · 내장 Liquid Retina XDR(논리 1512×982, scaleFactor 2) · 다크 모드
- 터미널에 손쉬운 사용 권한 없음 → **OS 수준 실클릭·스크린 캡처 자동화 불가**. 앱 내부 `capturePage`·`sendInputEvent` 하네스로 대체, 나머지는 수동 체크리스트

## 배치된 에이전트

| 툴 | 경로 | 배치 | 확인일 |
|---|---|---|---|
| Claude Code | `.claude/agents/*.md` | `backend` · `frontend` · `infra` · `product-planner` · `qa` · `researcher` · `review` · `vision` · `web-design` (9) | 2026-09-15 |
| Codex | `.codex/agents/*.toml` | `backend` · `frontend` · `qa` · `review` (4) | 2026-09-17 |

- Codex에는 **vision·infra·product-planner·researcher·web-design이 없다.** 해당 영역 작업이 필요하면 사용자에게 먼저 알리고 범위를 조정한다
- `AGENTS.md`(Codex용 PM 페르소나)의 `ls .Codex/agents/`는 대소문자 오타 — 실제는 `.codex/agents/`

- **미배치**: `ai-engineer` (LLM 기능 없음)
- `infra`는 **5단계(배포)부터** 투입
- `product-planner`는 신규 기능·범위 컷에만. 정본에 확정된 마일스톤·설계는 재논의하지 않음
- `researcher` 결론은 근거 등급(확인됨/주장됨/추정) + 확인 날짜 필수
- `.claude/agents/*.md`와 루트 `CLAUDE.md`는 `~/Documents/GitHub/my-agents`를 가리키는 **절대경로 심볼릭 링크** → 저장소에 커밋하지 않음

## 위임 운영 교훈

- **앱을 띄우거나 저장소 파일을 만지는 에이전트는 동시에 돌리지 않는다** (qa 실측 중 backend가 같은 파일을 고칠 뻔함). 읽기 전용 review·vision은 병렬 가능
- 병렬로 커밋할 때는 파일 담당을 나누고 `git add <자기 경로>`만 사용
