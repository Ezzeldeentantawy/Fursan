import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/react.fursan/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'chunk-lucide':     ['lucide-react'],
          'chunk-icons-fa':   ['react-icons/fa'],
          'chunk-icons-md':   ['react-icons/md'],
          'chunk-icons-io':   ['react-icons/io', 'react-icons/io5'],
          'chunk-icons-misc': ['react-icons/bs', 'react-icons/hi', 'react-icons/hi2', 'react-icons/ai', 'react-icons/fi', 'react-icons/gi', 'react-icons/ri', 'react-icons/si', 'react-icons/ti', 'react-icons/vsc', 'react-icons/tb', 'react-icons/ci'],
        },
      },
    },
  },
})
