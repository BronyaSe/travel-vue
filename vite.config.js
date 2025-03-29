import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '::', // 监听所有 IPv4 和 IPv6 地址
    port: 80, // 端口号（默认 5173）
    strictPort: true, // 严格模式（端口被占用时直接报错）
    hmr: {
      // 热更新配置（如果通过 IPv6 访问，需设置 host）
      host: 'pc.bronyahan.top' // 或具体的 IPv6 地址（如 ::1）
    }
  }
})
