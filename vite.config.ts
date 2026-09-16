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
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  // 렌더러는 네트워크를 쓰지 않는다(데이터는 main이 IPC로 전달).
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

function buildCsp(): Plugin {
  const meta = `<meta http-equiv="Content-Security-Policy" content="${BUILD_CSP}" />`
  return {
    name: 'geurus:build-csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      // CSP meta는 스크립트·스타일 태그보다 앞에 있어야 그 요소들에 적용된다.
      // injectTo:'head'는 Vite가 넣은 엔트리 <script>·<link> 뒤에 붙어서, charset 바로 뒤에 직접 삽입한다.
      handler(html) {
        const charset = /<meta\s+charset=[^>]*>/i
        if (!charset.test(html)) throw new Error('[geurus:build-csp] index.html에 <meta charset>가 없습니다')
        return html.replace(charset, (tag) => `${tag}\n    ${meta}`)
      },
    },
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
