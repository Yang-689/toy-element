import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import terser from '@rollup/plugin-terser'
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from 'path'
import { readdirSync, readdir, readFile, readFileSync } from 'fs'
import { defer, delay, filter, map, includes } from 'lodash-es'
import shell from 'shelljs'
import hooks from '../hooksPlugin'

const TRY_MOVE_STYLES_DELAY = 750 as const

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const isDev = mode === 'development'
  const isTest = mode === 'test'

  const root = resolve(__dirname, '../../../'); // monorepo 根
  const env = loadEnv(mode, root, '');

  return {
    plugins: [
      vue(),
      visualizer({
        filename: "dist/stats.es.html",
      }),
      dts({
        tsconfigPath: '../../tsconfig.build.json',
        outDir: 'dist/types',
      }),
      terser({
        // 压缩
        compress: {
          sequences: isProd,
          arguments: isProd,
          drop_console: isProd && ['log'],
          drop_debugger: isProd,
          passes: isProd ? 4 : 1,
          global_defs: {
            '@DEV': JSON.stringify(isDev),
            '@PROD': JSON.stringify(isProd),
            '@TEST': JSON.stringify(isTest),
          },
        },
        // 格式化
        format: {
          semicolons: false,
          shorthand: isProd,
          braces: !isProd,
          beautify: !isProd,
          comments: !isProd,
        },
        // 混淆
        mangle: {
          toplevel: isProd,
          eval: isProd,
          keep_classnames: isDev,
          keep_fnames: isDev,
        },
      }),
      hooks({
        rmFiles: ['./dist/es', './dist/theme', './dist/types'],
        afterBuild: moveStyles,
      }),
    ],
    build: {
      outDir: 'dist/es',
      cssCodeSplit: true,
      minify: false, // 关闭默认混淆，使用插件处理
      lib: {
        entry: resolve(__dirname, '../index.ts'),
        name: 'EricUI',
        fileName: 'index',
        formats: ['es'],
      },
      rollupOptions: {
        external: [
          'vue',
          '@fortawesome/fontawesome-svg-core',
          '@fortawesome/free-solid-svg-icons',
          '@fortawesome/vue-fontawesome',
          '@popperjs/core',
          'async-validator',
          'dayjs',
          'element-plus',
          'lodash-es',
          'nprogress',
          'qs',
          'vue-router',
          'vuex',
        ],
        output: {
          assetFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'style.css') {
              return 'index.css'
            }
            if (chunkInfo.type === 'asset' && /\.(css)$/i.test(chunkInfo.name as string)) {
              return 'theme/[name].[ext]'
            }
            return chunkInfo.name as string
          },
          manualChunks(id) {
            if (includes(id, 'node_modules')) return 'vendor'

            if (includes(id, '/packages/hooks')) return 'hooks'

            if (includes(id, '/packages/utils') || includes(id, 'plugin-vue:export-helper')) return 'utils'

            for (const item of getDirectoriesSync('../components')) {
              if (includes(id, `/packages/components/${item}`)) return item
            }
          },
        },
      },
    },
  }
})

function getDirectoriesSync(basePath: string) {
  const entries = readdirSync(basePath, { withFileTypes: true })
  return map(
    filter(entries, (entry) => entry.isDirectory()),
    (entry) => entry.name,
  )
}

function moveStyles() {
  readdir('./dist/es/theme', (err) => {
    if (err) return delay(moveStyles, TRY_MOVE_STYLES_DELAY)
    defer(() => shell.mv('./dist/es/theme', './dist'))
  })
}
