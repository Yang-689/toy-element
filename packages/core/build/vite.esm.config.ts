import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { readdirSync, readdir } from 'fs'
import { defer, delay, filter, map, includes } from 'lodash-es'
import shell from 'shelljs'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: '../../tsconfig.build.json',
      outDir: 'dist/types',
    }),
  ],
  build: {
    outDir: 'dist/es',
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
          return chunkInfo.name as string
        },
        manualChunks(id) {
          if (includes(id, 'node_modules')) return 'vendor'

          if (includes(id, '/packages/hooks')) return 'hooks'

          if (includes(id, '/packages/utils') || includes(id, 'plugin-vue:export-helper')) return 'utils'

          for (const item of getDirectoriesSync('../components')) {
            console.log(item, 'item')
            if (includes(id, `/packages/components/${item}`)) return item
          }
        },
      },
    },
  },
})

function getDirectoriesSync(basePath: string) {
  const entries = readdirSync(basePath, { withFileTypes: true })
  debugger
  return map(
    filter(entries, (entry) => entry.isDirectory()),
    (entry) => entry.name,
  )
}

// function moveStyles() {
//   readdir("./dist/es/theme", (err) => {
//     if (err) return delay(moveStyles, TRY_MOVE_STYLES_DELAY);
//     defer(() => shell.mv("./dist/es/theme", "./dist"));
//   });
// }
