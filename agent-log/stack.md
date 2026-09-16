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
- ⚠️ **Electron 30은 지원 종료**, `npm audit` 7건(electron·extract-zip high / esbuild·@vitest/mocker moderate). 해결엔 메이저 업그레이드 필요 → **사용자 결정 대기**

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

## 배치된 에이전트 (`.claude/agents/`, 확인일 2026-09-15)

`backend` · `frontend` · `infra` · `product-planner` · `qa` · `researcher` · `review` · `vision` · `web-design`

- **미배치**: `ai-engineer` (LLM 기능 없음)
- `infra`는 **5단계(배포)부터** 투입
- `product-planner`는 신규 기능·범위 컷에만. 정본에 확정된 마일스톤·설계는 재논의하지 않음
- `researcher` 결론은 근거 등급(확인됨/주장됨/추정) + 확인 날짜 필수
- `.claude/agents/*.md`와 루트 `CLAUDE.md`는 `~/Documents/GitHub/my-agents`를 가리키는 **절대경로 심볼릭 링크** → 저장소에 커밋하지 않음

## 위임 운영 교훈

- **앱을 띄우거나 저장소 파일을 만지는 에이전트는 동시에 돌리지 않는다** (qa 실측 중 backend가 같은 파일을 고칠 뻔함). 읽기 전용 review·vision은 병렬 가능
- 병렬로 커밋할 때는 파일 담당을 나누고 `git add <자기 경로>`만 사용
