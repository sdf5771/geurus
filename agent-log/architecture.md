# 아키텍처 결정과 이유

> 최종 갱신: 2026-09-15 · 1단계 구현 기준

## main 프로세스 (`electron/`)

| 파일 | 역할 |
|---|---|
| `main.ts` | 창 생성·수명주기·탐색 차단·단일 인스턴스·앱 메뉴 제거·로드 |
| `overlayRecovery.ts` | 클릭 통과 복구·탐색 허용 판정·크래시 reload 정책 (순수 로직, 테스트 18) |
| `ignoreMouse.ts` | IPC 핸들러 순수 로직 |
| `overlayBounds.ts` | 초기 위치 계산 |
| `tray.ts` · `trayGlyph.ts` | 템플릿 이미지를 글리프 **데이터에서** 생성(PNG 없음), 메뉴 `종료` |
| `preload.ts` | `window.geurus` 브리지 |

### 창

- `transparent` · `frame:false` · `hasShadow:false` · `backgroundColor:'#00000000'` · `alwaysOnTop('screen-saver')` → CGWindow layer 1000 · `setVisibleOnAllWorkspaces(true, {visibleOnFullScreen:true})` · `app.dock.hide()` (accessory)
- `contextIsolation:true` · `nodeIntegration:false` · **`sandbox:true`**(번들 preload가 CJS) · `devTools: !app.isPackaged`
- `show:false` → `ready-to-show`에서 **`showInactive()`** — 실행 직후 포커스 탈취 방지(qa B2)
- `Menu.setApplicationMenu(null)` — ⌘R·⌘W·⌥⌘I 차단. ⚠️ **4단계에 입력 UI가 생기면 macOS 복사·붙여넣기용 `role:'editMenu'` 최소 메뉴 필요**
- `window-all-closed` → `app.quit()`

### 클릭 통과 복구 — 이벤트 순서 실측 (Electron 30.5.1) ⚠️ 재조사 방지

| 시나리오 | 순서 |
|---|---|
| 막힌 외부 탐색 | did-start-loading → did-start-navigation → will-navigate(차단) → did-stop-loading · **did-navigate 없음** |
| 렌더러 `location.reload()` | did-start-loading → did-start-navigation → will-navigate(같은 URL) → did-frame-navigate → **did-navigate** → dom-ready → did-finish-load |
| main `webContents.reload()` | did-start-loading → did-start-navigation → did-frame-navigate → **did-navigate** → … · **will-navigate 없음** |
| same-document(hash·pushState) | … → did-navigate-in-page · will-navigate·did-navigate 없음 |
| 크래시 후 reload | render-process-gone → (reload) → … → **did-navigate** |

- `did-start-loading`·`did-start-navigation`은 **항상 `will-navigate`보다 먼저** → 그 시점엔 차단 여부를 모름
- **결정**: 클릭 통과 복귀는 **`did-navigate`**(새 문서 커밋)에서만. 크래시(`render-process-gone`)는 즉시 복귀 후 정책 reload
- **이유**: 처음엔 `did-start-loading`에서 복귀했으나 막힌 탐색에서도 복귀해 그루 위 클릭이 새는 버그(qa N1)
- 렌더러 마운트 `sync()`와 **이중 복구** — main은 크래시를, 렌더러는 커밋 직후 늦게 도착한 `false` IPC를 막음

### 탐색 차단

- `will-navigate`: `isAllowedNavigation`만 허용 — 해시 제외 **앱 진입 URL**(빌드 `pathToFileURL(dist/index.html)`, dev 서버 URL) / **현재 URL** / **dev 서버 origin**. 나머지 차단 + 비패키징 warn
- **이유**: 무조건 차단은 렌더러 재로드·Vite full-reload까지 막았음(review M-A, qa 4/4 재현)
- URL 판정 오류는 모두 **차단 쪽**(review 확인) — `currentUrl` 후보가 인코딩 차이를 받쳐 주므로 유지
- 새 창: `setWindowOpenHandler` → deny

### 크래시 reload 정책

- reload 사유: `crashed`·`oom`·`abnormal-exit`·`killed` / 안 함: `clean-exit`·`launch-failed`·`integrity-failure`·그 외
- **60초 3회 한도**(`performance.now()`) — 초과 시 창은 투명 클릭 통과로 남고 트레이 `종료`로 끔
- TODO(2단계 이후): 한도 초과로 그루가 사라지면 트레이 상태 등으로 알림 검토

### 단일 인스턴스

- 빌드: `requestSingleInstanceLock()` 실패 시 warn + quit
- **dev 서버 모드는 잠금 생략** — 이유: vite-plugin-electron이 이전 인스턴스에 SIGTERM 후 기다리지 않고 spawn → 종료 중(약 100ms) 새 인스턴스가 잠금 요청 시 **잠금은 true인데 app `ready`가 오지 않음**(5/10 교대 재현, 내부 원인 미확인). warn 방식은 잠금이 true라 무의미
- 부작용(수용): dev 이중 실행 시 트레이·그루 2개
- 빌드 종료 직후 즉시 재실행 3/3·종료 중 겹침 3/3은 정상(qa)

### 로드·CSP

- dev URL은 `!app.isPackaged && VITE_DEV_SERVER_URL`일 때만 사용
- 빌드 전용 CSP: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`
- 삽입: `transformIndexHtml(order:'post')`로 **`<meta charset>` 바로 뒤**. `injectTo:'head'`는 meta가 엔트리 script·link **뒤**에 붙어 적용 누락됨. charset 없으면 빌드 실패
- dev는 CSP 없음(React Refresh 인라인 프리앰블)

## 렌더러 (`src/`)

| 파일 | 역할 |
|---|---|
| `sprite/{palette,pose,leaf,expr}.ts` | 원본 데이터 이식 ([design.md](design.md)) |
| `sprite/compose.ts` | `composeLayers` / `composeGrid` — **POSE → LEAF(leafCoord) → EXPR** |
| `sprite/raster.ts` · `atlas.ts` | 셀·배율 계산, 아틀라스 굽기, 1:1 blit |
| `sprite/hitbox.ts` | 불투명 픽셀 bounding box → CSS 사각형 |
| `overlay/{placement,hitTracker,ignoreMouseBridge}.ts` · `OverlayStage.tsx` | 배치·히트 트래커·브리지·스테이지 |

- **래스터화**: 배율(×1·×2·×3)당 아틀라스 1장(행=포즈 4, 열=잎 4×표정 7=28) → 336셀. 셀 = (16+2·PAD_X)×(18+2·PAD_Y) = 26×32 × `p=round(scale×dpr)`. 정수 `fillRect`, `imageSmoothingEnabled=false`, 표시 시 **1:1 blit만**
- 부팅 12~18ms(dev, dpr 2) · 메모리 약 21MB(dpr 2, 1단계 실사용은 ×2뿐). 배율별 지연 굽기는 선택지로 남김
- dpr 변경 시 재굽기 없음(1단계 제한 — 창이 주 디스플레이 고정)
- 정지 렌더: `stand`+`idle`+`pair` ×2, **rAF 없음**. 앵커 (8,16) 가로 중앙, 셀 바닥 = 창 바닥 → 발밑 CSS y=222
- 히트박스: bbox(스프라이트 x 2~13, y 1~15) → CSS left 168 · top 192 · right 192 · bottom 222, 반열림. **사각형이라 잎 틈·투명 모서리도 그루가 가져감(의도 — 경계 깜빡임 방지)**
- ⚠️ 3단계 전 검토: `stageAnchor`가 pixelScale에 따라 앵커 y가 바뀜 → spawn(×1→×3)에서 발이 튈 수 있음(review Nit-1)

## 알려진 위험

- 크래시 한도 초과 시 그루가 사라진 채 알림 없음(2단계 이후)
- Nit-A~D 후속 백로그 ([history/2026-09.md](history/2026-09.md))
