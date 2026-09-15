import { useEffect, useRef } from 'react'
import { drawSprite, type AtlasSet } from '../sprite/atlas'
import { composeGrid } from '../sprite/compose'
import type { ExprKey } from '../sprite/expr'
import { boundsToCssRect, isInsideRect, opaqueBounds } from '../sprite/hitbox'
import { leafFor, type LeafKey } from '../sprite/leaf'
import type { PoseKey } from '../sprite/pose'
import type { SpriteScale } from '../sprite/raster'
import { createHitTracker } from './hitTracker'
import { createIgnoreMouseSender } from './ignoreMouseBridge'
import { cellOriginForAnchor, stageAnchor } from './placement'

/** 1단계 정지 렌더 — 그루 1마리, stand + idle + pair, ×2(GARDEN idle 배율) */
const STAGE_SCALE: SpriteScale = 2
const STAGE_POSE: PoseKey = 'stand'
const STAGE_LEAF: LeafKey = leafFor(STAGE_SCALE, 'pair')
const STAGE_EXPR: ExprKey = 'idle'

/** 페이지당 하나 — 브리지 부재 경고가 StrictMode 이중 마운트에도 한 번만 뜨게 모듈 범위에 둔다 */
const sendIgnoreMouse = createIgnoreMouseSender(
  () => window.geurus,
  () => {
    if (import.meta.env.DEV) {
      console.warn('[geurus] window.geurus is missing (preload not loaded?) — click-through IPC disabled')
    }
  },
)

interface OverlayStageProps {
  atlases: AtlasSet
  dpr: number
}

export function OverlayStage({ atlases, dpr }: OverlayStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const atlas = atlases.get(STAGE_SCALE)
    if (!canvas || !atlas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // backing store = CSS 크기 × dpr. 아틀라스가 이미 scale×dpr로 구워져 있어 1:1 blit만 한다.
    canvas.width = Math.round(canvas.clientWidth * dpr)
    canvas.height = Math.round(canvas.clientHeight * dpr)
    ctx.imageSmoothingEnabled = false

    const cell = cellOriginForAnchor(
      stageAnchor(canvas.width, canvas.height, atlas.pixelScale),
      atlas.pixelScale,
    )
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawSprite(ctx, atlas, STAGE_POSE, STAGE_LEAF, STAGE_EXPR, cell.x, cell.y)

    // 히트박스 = 렌더된 합성 그리드의 불투명 픽셀 bounding box (잎 사이 틈에서 깜빡이지 않게)
    const bounds = opaqueBounds(composeGrid(STAGE_POSE, STAGE_LEAF, STAGE_EXPR))
    const hitRect = bounds && boundsToCssRect(bounds, cell.x, cell.y, atlas.pixelScale, dpr)
    const tracker = createHitTracker(sendIgnoreMouse)
    // 재로드 등으로 main 상태가 트래커의 "밖" 가정과 어긋날 수 있어 마운트 시 클릭 통과로 맞춘다
    tracker.sync()

    const handleMouseMove = (event: MouseEvent) => {
      tracker.update(isInsideRect(hitRect, event.clientX, event.clientY))
    }
    const handleMouseLeave = () => tracker.leave()
    const handleClick = (event: MouseEvent) => {
      if (import.meta.env.DEV && isInsideRect(hitRect, event.clientX, event.clientY)) {
        console.debug('[geurus] geuru click captured', event.clientX, event.clientY)
      }
    }

    const root = document.documentElement
    window.addEventListener('mousemove', handleMouseMove)
    root.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      root.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('click', handleClick)
      tracker.leave()
    }
  }, [atlases, dpr])

  return <canvas ref={canvasRef} className="overlay-stage" />
}
