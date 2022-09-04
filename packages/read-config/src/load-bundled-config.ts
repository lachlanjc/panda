import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'

export function loadBundledFile(fileName: string, bundledCode: string): Promise<any> {
  const __require = createRequire(import.meta.url)

  const extension = path.extname(fileName)
  const realFileName = fs.realpathSync(fileName)

  const defaultLoader = __require.extensions[extension]!

  __require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === realFileName) {
      const __module = module as any
      __module._compile(bundledCode, filename)
    } else {
      defaultLoader(module, filename)
    }
  }

  // clear cache in case of server restart
  delete __require.cache[__require.resolve(fileName)]

  const raw = __require(fileName)
  const config = raw.__esModule ? raw.default : raw
  __require.extensions[extension] = defaultLoader

  return config
}