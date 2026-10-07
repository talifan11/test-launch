import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// watch.ignored обязателен: без него vite следит за src-tauri и сборка
// на Windows упирается в лимит файлов/блокировки target/
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  build: {
    target: 'es2021',
    sourcemap: false,
  },
});
