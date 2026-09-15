import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

const root = path.dirname(fileURLToPath(import.meta.url))

// 빌드 산출물에만 CSP를 넣는다. dev는 React Refresh 인라인 프리앰블과 HMR 웹소켓이 필요해 넣지 않는다.
const BUILD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

function buildCsp(): Plugin {
  return {
    name: 'geurus:build-csp',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: BUILD_CSP },
        injectTo: 'head-prepend',
      },
    ],
  }
}

export default defineConfig({
  // loadFile(file://)로 열리므로 에셋 경로를 상대 경로로 둔다.
  base: './',
  plugins: [
    react(),
    buildCsp(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(root, 'electron/preload.ts'),
        vite: {
          build: {
            rollupOptions: {
              // 샌드박스 preload는 CJS로만 로드된다. 확장자도 .cjs로 고정해 형식을 명확히 한다.
              output: { entryFileNames: '[name].cjs', chunkFileNames: '[name].cjs' },
            },
          },
        },
      },
    }),
  ],
})
