import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OverlayStage } from './overlay/OverlayStage'
import { ATLAS_CELLS_PER_SCALE, bakeAllAtlases } from './sprite/atlas'
import './index.css'

// 부팅 시 한 번: 포즈 4 × 잎 4 × 표정 7 × 배율 3을 scale×dpr 정수 배율로 굽는다. 이후 blit만.
// 1단계 창은 주 디스플레이에 고정이라 dpr 변경(모니터 이동) 시 재굽기는 하지 않는다.
const dpr = window.devicePixelRatio || 1
const bakeStart = performance.now()
const atlases = bakeAllAtlases(dpr)
if (import.meta.env.DEV) {
  const elapsed = (performance.now() - bakeStart).toFixed(1)
  console.debug(`[geurus] baked ${atlases.size * ATLAS_CELLS_PER_SCALE} sprites (dpr ${dpr}) in ${elapsed}ms`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OverlayStage atlases={atlases} dpr={dpr} />
  </StrictMode>,
)
