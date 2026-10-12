import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // 사이트맵은 백엔드가 만든다 (운영 nginx 도 같은 규칙)
      '/sitemap.xml': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // 관리자 페이지는 폴더/index.tsx 라 청크 이름이 전부 index-*.js 가 되므로 폴더 이름을 쓴다
        chunkFileNames: (chunk) => {
          const m = (chunk.facadeModuleId ?? '').replace(/\\/g, '/').match(/\/pages\/([^/]+)\/index\.tsx$/);
          return m ? `assets/${m[1]}-[hash].js` : 'assets/[name]-[hash].js';
        },
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['antd'],
          // CKEditor 는 관리자·자유게시판 글쓰기에서만 쓴다 — 지연 로딩되는 별도 청크
          editor: ['ckeditor5', '@ckeditor/ckeditor5-react'],
        },
      },
    },
  },
})
