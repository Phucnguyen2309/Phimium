import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      // FE gọi '/api' cùng domain -> Vite chuyển tiếp sang Backend, cookie đăng nhập là first-party
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
