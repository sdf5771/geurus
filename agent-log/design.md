# 디자인 원본 · 브랜드 · 라이팅

> 최종 갱신: 2026-09-15

## 디자인 원본 (`docs/design/`)

Claude Design `https://claude.ai/design/p/090eeae0-32c6-408c-af34-5105f88aea58`에서 export → **5종만 남기고 정리** [사용자 지시 2026-09-15]

| 파일 | 정본·브리프 표기 | 내용 |
|---|---|---|
| `motion-system.html` | `Geurus_모션_시스템.html` | POSE 4종 · MOTION 7종 · EXPR(**옛 버전 — think에 zzz**) · `PAD_X/PAD_Y` · 앵커 |
| `screen-layout.html` | `Geurus_화면_구성.html` | BUBBLE · GARDEN |
| `finishing-set.html` | `Geurus_마감_세트.html` | LEAF · LEAF_OFFSET · AGENT_TYPE · TRAY · 빈 상태 · EXPR 5종(**최신**) |
| `character.html` | `GitGrove_Character.html` | 그루 팔레트 · 표정 · Do/Don't (GitGrove 원본) |
| `writing-guide.html` | `GitGrove_라이팅_가이드.html` | **프로젝트 라이팅 가이드** |

- 제거: `docs/design/CLAUDE.md`(GitGrove 디자인 프로젝트 지시문 — 자동 로드 혼동 위험), GitGrove 화면 시안 30여 개 등 60개 → 휴지통 `~/.Trash/geurus-docs-design-20260915-203759/`
- 에이전트에게 "GitGrove 기존 화면과 일관성"을 요구하지 않는다. 브랜드 기준은 위 5종 + 정본 4절
- `scripts/snapshot-sprite-original.mjs`가 `finishing-set.html`·`motion-system.html`을 입력으로 씀 → **docs/design은 저장소에 커밋해야 함**
- `docs/transcript-schema.md` = 정본의 `claude-code-transcript-schema.md`

## EXPR 이식 원본 — 키별 지정 ⚠️ [실측 2026-09-15]

zzz는 **`sleepy` 전용**(사용자 확정). 원본마다 버전이 달라 키별로 지정:

| 파일 | `think` | `sleepy` |
|---|---|---|
| `motion-system.html` | ✗ zzz `8,13`·`7,13` (옛 버전) | zzz 없음 |
| `character.html` | ✗ zzz 있음 | zzz 3개 |
| **`finishing-set.html`** | ✓ **zzz 없음** | ✓ **`5,13`·`4,14`** |

- `think`·`sleepy` ← finishing-set · `idle`·`happy`·`conflict` ← 두 파일 동일 · `blink`·`merge` ← motion-system
- 테스트로 고정: `EXPR.think`에 `z` 없음, `sleepy`에 `5,13`·`4,14`
- vision 독립 검증: PAL·POSE·LEAF·LEAF_OFFSET·EXPR·TRAY_GLYPH 원본과 일치, POSE×LEAF·EXPR 7종 PNG가 원본과 **바이트 동일**

## 원본 데이터 이슈 — 처리 완료

1. **stretch 잎 겹침 → C 확정** [사용자 2026-09-16]
   - 현상: `LEAF_OFFSET.stretch.spread=-1`이 중심 옆 열(7↔8)을 맞바꿔 서로 다른 키가 같은 칸으로 모임 — `triple` (1,7), `stem` (2,7)·(2,8), `bud` (1,7)·(1,8). 결과로 stretch × triple은 가운데 잎이 좌우 반전, stretch × bud는 봉오리 속 짙은 픽셀이 축소
   - **이식 오류 아님** — 원본 HTML 렌더와 PNG 바이트 동일(vision)
   - 조치: 그대로 두고 **정본 3-8에 적용 계약 명시**(패치는 키 삽입 순서대로, 겹치면 나중 키 우선). 재구현·리팩터에서 결과가 조용히 달라지는 것을 막기 위함
   - **3단계 재검토 예약**: 모션이 실제로 재생돼 stretch가 화면에 보일 때 어색하면 그때 디자인 원본을 손보고 다시 이식
2. **정본·PM 브리프 정정 완료** [사용자 허가 2026-09-16, PM 수정 — 정본 v2.6]
   - "행 8~11 좌표 4종 동일" → **EXPR이 덮는 칸** 기준임을 명시(squash 행 11의 1·12·14열은 다름)
   - "EXPR = 행 8~11" → `sleepy` zzz는 행 4~5, `conflict` 땀도 눈·입 밖임을 4중 레이어 설명에 추가
   - "표정 6종 · 288장" → **7종 · 336장**(정본 3-4·4-1, PM 브리프 8절)
   - 옛 파일명 → `docs/design/*` 현재 경로(정본 0-1·3-4·3-5·3-7·3-8·3-9·4절·9절, PM 브리프 2절)
   - PM 브리프 7절 트레이 메뉴 "종료·설정" → **`종료`만**(설정은 이후 단계)
   - 정본 2절 마일스톤 1 상태 → 완료(PR #1), 수동 검증 일부 대기 표기

## 브랜드 하드 룰 (vision 감사 · PM 머지 전 확인)

- 그루: **정수배 확대만**, 회전·기울임·blur·그림자 금지, 몸통 골드 `#e6a536`·새싹 그린 `#6fcf7c` 변경 금지, 팔레트 밖 색 금지, 스쿼시/스트레치는 그리드로
- 캔버스 이식: `width="1.02"` → 1 · 배율별 따로 굽기 · 패딩 셀 `PAD_X=5, PAD_Y=7` · 앵커 하단 중앙(8,16) · `imageSmoothingEnabled=false`
- 16px 미만은 잎 변주 생략(`leafFor` → `pair`)
- 트레이: 템플릿 이미지(검정+알파만), 2x는 정수 확대

## 라이팅

- 가이드: `docs/design/writing-guide.html` (`docs/WRITING_GUIDE.md`로 옮기는 작업은 **미완료**)
- 해요체·한국어 먼저·짧게·가운뎃점 `·`·서양 숫자(99+)·에러는 사유 먼저 코드 뒤·느낌표/과장/장식 이모지 금지
- 1단계 노출 텍스트는 트레이 메뉴 **`종료`** 하나 — GitGrove 트레이 선례와 동일, vision·qa 가이드 부합 확인
