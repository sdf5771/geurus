// 1단계 placeholder — 투명창 확인용 빈 React 루트. 실제 내용은 frontend가 교체한다.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

createRoot(document.getElementById('root')!).render(<StrictMode />)
