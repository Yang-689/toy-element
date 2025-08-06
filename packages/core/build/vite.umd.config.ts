import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import terser from '@rollup/plugin-terser'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { compression } from 'vite-plugin-compression2'
import shell from 'shelljs'
import { defer, delay } from 'lodash-es'
import hooks from '../hooksPlugin'
import * as process from 'node:process'

const TRY_MOVE_STYLES_DELAY = 750 as const

function moveStyles() {
  try {
    readFileSync('./dist/umd/index.css.gz')
  } catch (err) {
    return delay(moveStyles, TRY_MOVE_STYLES_DELAY)
  }
  shell.cp('./dist/umd/index.css', './dist/index.css')
}

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const isDev = mode === 'development'
  const isTest = mode === 'test'

  const root = resolve(__dirname, '../../../') // monorepo 根
  const env = loadEnv(mode, root, '')
  return {
    plugins: [
      vue(),
      compression({ include: /.(cjs|css)$/i }),
      terser({
        compress: {
          drop_console: ['log'],
          drop_debugger: true,
          passes: 3,
          global_defs: {
            '@DEV': JSON.stringify(isDev),
            '@PROD': JSON.stringify(isProd),
            '@TEST': JSON.stringify(isTest),
          },
        },
      }),
      hooks({
        afterBuild: moveStyles,
      }),
    ],
    build: {
      outDir: 'dist/umd',
      lib: {
        entry: resolve(__dirname, '../index.ts'),
        name: 'EricUI',
        fileName: 'index',
        formats: ['umd'],
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          exports: 'named',
          globals: {
            vue: 'Vue',
          },
          assetFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'style.css') {
              return 'index.css'
            }
            return chunkInfo.name as string
          },
        },
      },
    },
  }
})
