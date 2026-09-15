/**
 * 그루 스프라이트 원본 스냅샷 생성기 — 디자인 원본 HTML의 <script>를 node:vm으로 그대로 실행해
 * 테스트 fixture(`src/sprite/__fixtures__/sprite.original.ts`)를 만든다. 새 의존성 없이 node 내장 모듈만 쓴다.
 *
 * 실행 (저장소 루트에서):
 *   node scripts/snapshot-sprite-original.mjs          # fixture 재생성
 *   node scripts/snapshot-sprite-original.mjs --check  # 기존 fixture와 비교만 (다르면 exit 1)
 *
 * 입력:
 *   - docs/design/finishing-set.html  — POSE · LEAF · LEAF_OFFSET · applyLeaf · gridWithLeaf · rects · EXPR 5종
 *   - docs/design/motion-system.html  — POSE(대조용) · EXPR · spriteRects
 *
 * EXPR 키별 원본 (PM 실측 · 사용자 확정 규칙):
 *   - think · sleepy            ← finishing-set  (motion-system의 think에는 옛 zzz 8,13·7,13이 남아 있음)
 *   - blink · merge             ← motion-system  (finishing-set에 없음)
 *   - idle · happy · conflict   ← finishing-set  (두 파일 동일 — 스크립트가 확인하고, 다르면 중단)
 *
 * 합성은 원본 렌더 함수가 낸 SVG <rect> 목록을 팔레트 역참조로 문자 그리드에 되돌려 얻는다.
 * (finishing-set 키는 `rects(gridWithLeaf(leaf, pose), expr)`, motion-system 키는 `spriteRects(같은 그리드, expr)`)
 * 테스트는 이 fixture만 읽고 docs/에는 런타임 의존을 두지 않는다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DESIGN = path.join(ROOT, 'docs/design')
const OUT = path.join(ROOT, 'src/sprite/__fixtures__/sprite.original.ts')

const POSES = ['stand', 'squash', 'stretch', 'lean']
const LEAVES = ['pair', 'triple', 'stem', 'bud']
const EXPRS = ['idle', 'blink', 'happy', 'think', 'merge', 'conflict', 'sleepy']
const EXPR_FROM_MOTION_SYSTEM = new Set(['blink', 'merge'])
const EXPR_SHARED = ['idle', 'happy', 'conflict']

function fail(message) {
  console.error(`[snapshot] ${message}`)
  process.exit(1)
}

/** 원본 HTML의 첫 <script>에서 startMarker ~ endMarker 구간을 vm에서 실행하고 expose 식의 값을 돌려준다 */
function runOriginal(file, startMarker, endMarker, expose) {
  const html = fs.readFileSync(path.join(DESIGN, file), 'utf8')
  const scriptStart = html.indexOf('<script>')
  if (scriptStart < 0) fail(`${file}: <script> not found`)
  const body = html.slice(scriptStart + '<script>'.length)
  const a = body.indexOf(startMarker)
  const b = body.indexOf(endMarker)
  if (a < 0 || b < 0 || b <= a) fail(`${file}: markers not found (${startMarker} .. ${endMarker})`)
  const context = vm.createContext({})
  vm.runInContext(`${body.slice(a, b)}\n;globalThis.__expose = (${expose});`, context, { filename: file })
  return context.__expose
}

const F = runOriginal(
  'finishing-set.html',
  'const PAL=',
  'function geuru(',
  '{ PAL, POSE, LEAF, LEAF_OFFSET, EXPR, applyLeaf, gridWithLeaf, rects }',
)
const M = runOriginal('motion-system.html', 'const PAL=', 'function frameSVG', '{ PAL, POSE, EXPR, spriteRects }')

const canon = (value) =>
  JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort()) : v,
  )

// 원본 간 전제 확인 — 어긋나면 fixture를 만들지 않는다
if (canon(F.PAL) !== canon(M.PAL)) fail('PAL differs between finishing-set and motion-system')
if (canon(F.POSE) !== canon(M.POSE)) fail('POSE differs between finishing-set and motion-system')
for (const key of EXPR_SHARED) {
  if (canon(F.EXPR[key]) !== canon(M.EXPR[key])) fail(`EXPR.${key} differs between originals`)
}
for (const key of EXPRS) {
  const source = EXPR_FROM_MOTION_SYSTEM.has(key) ? M : F
  if (!source.EXPR[key]) fail(`EXPR.${key} missing in designated original`)
}

const colorToKey = new Map(
  Object.entries(F.PAL)
    .filter(([, color]) => color)
    .map(([key, color]) => [color, key]),
)
if (colorToKey.size !== 12) fail('PAL colors are not unique')

/** 원본 렌더 함수의 SVG <rect> 목록 → 16×18 문자 그리드 */
function rectsToGrid(svg) {
  const cells = Array.from({ length: 18 }, () => Array(16).fill('.'))
  const pattern = /<rect x="(\d+)" y="(\d+)" width="1\.02" height="1\.02" fill="(#[0-9a-f]{6})"\/>/g
  let count = 0
  for (const [, x, y, color] of svg.matchAll(pattern)) {
    const key = colorToKey.get(color)
    if (!key) fail(`color outside PAL: ${color}`)
    cells[Number(y)][Number(x)] = key
    count++
  }
  if (count !== (svg.match(/<rect /g) ?? []).length) fail('unparsed <rect> in original output')
  return cells.map((row) => row.join(''))
}

const applyLeaf = {}
for (const pose of POSES) {
  for (const leaf of LEAVES) applyLeaf[`${pose}/${leaf}`] = [...F.applyLeaf(F.POSE[pose], pose, leaf)]
}

const compose = {}
for (const pose of POSES) {
  for (const leaf of LEAVES) {
    const grid = F.gridWithLeaf(leaf, pose)
    for (const expr of EXPRS) {
      const svg = EXPR_FROM_MOTION_SYSTEM.has(expr) ? M.spriteRects(grid, expr, null) : F.rects(grid, expr)
      compose[`${pose}/${leaf}/${expr}`] = rectsToGrid(svg)
    }
  }
}

function block(name, doc, record) {
  const entries = Object.entries(record)
    .map(([key, rows]) => `  '${key}': [\n${rows.map((row) => `    '${row}',`).join('\n')}\n  ],`)
    .join('\n')
  return `/** ${doc} */\nexport const ${name}: Readonly<Record<string, readonly string[]>> = {\n${entries}\n}\n`
}

const output = `/**
 * 그루 스프라이트 원본 스냅샷 — 테스트 전용. 손으로 고치지 않는다.
 * 생성: node scripts/snapshot-sprite-original.mjs (docs/design/finishing-set.html · motion-system.html을 node:vm으로 실행)
 * EXPR 키별 원본: think·sleepy ← finishing-set, blink·merge ← motion-system, idle·happy·conflict ← 두 파일 동일
 */

${block('APPLY_LEAF_ORIGINAL', 'finishing-set `applyLeaf(POSE[pose], pose, leaf)` — 키 `pose/leaf` (16)', applyLeaf)}
${block('COMPOSE_ORIGINAL', '원본 렌더 함수 결과를 문자 그리드로 되돌린 합성 — 키 `pose/leaf/expr` (112)', compose)}`

if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : ''
  if (current !== output) fail(`${path.relative(ROOT, OUT)} is out of date — run without --check`)
  console.log(`[snapshot] ${path.relative(ROOT, OUT)} matches originals (16 applyLeaf + 112 compose)`)
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, output)
  console.log(`[snapshot] wrote ${path.relative(ROOT, OUT)} (16 applyLeaf + 112 compose)`)
}
