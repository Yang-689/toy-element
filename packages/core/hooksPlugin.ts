import { each, isFunction } from 'lodash-es'
import shell from 'shelljs'

export default function hooksPlugin({
  rmFiles = [],
  beforeBuild,
  afterBuild,
}: {
  rmFiles?: string[]
  beforeBuild?: Function
  afterBuild?: Function
}) {
  return {
    name: 'hooksPlugin',
    buildStart() {
      // 移除旧文件 - 现在的 vite 自动会做删除操作
      each(rmFiles, (file) => shell.rm('-rf', file))

      isFunction(beforeBuild) && beforeBuild()
    },
    buildEnd(err?: Error) {
      !err && isFunction(afterBuild) && afterBuild()
    },
  }
}
