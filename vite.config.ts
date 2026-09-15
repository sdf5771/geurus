import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(root, 'electron/preload.ts'),
      },
      // 렌더러에 Node를 노출하지 않는다(nodeIntegration:false). 플러그인은 base './' 등 빌드 보정용.
      renderer: {},
    }),
  ],
})
