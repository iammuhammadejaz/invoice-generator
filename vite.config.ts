import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      buffer: path.resolve(projectRoot, 'node_modules/buffer'),
    },
  },
  define: {
    global: 'globalThis',
  },
  plugins: [devtools(), nitro(), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
