import { relative } from 'path'
import type { Plugin } from 'vite'

import { compileScript, parse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { resolveComponentNameByFileName, resolveComponentNameByPath } from './utils'

/**
 * 探测所有的页面，并根据页面路径生成页面组件的 name
 * pages/account/login.vue -> Pages.Account.Login
 * @reference vite-plugin-vue-setup-extend-plus
 */
export default (): Plugin => {
  return {
    name: 'vite:vue-page-name',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\.vue$/.test(id))
        return null

      if (!id.includes('pages') || id.includes('components'))
        return null

      return injectScript(code, id, 'path')
    },
  }
}

const componentNameResolvers = {
  path: resolveComponentNameByPath,
  file: resolveComponentNameByFileName,
}

export function injectScript(code: string, id: string, type: 'file' | 'path') {
  const s = new MagicString(code)
  const FILENAME_RE = /.*\/(\S*)/
  const { descriptor } = parse(code)
  if (!descriptor.script && descriptor.scriptSetup) {
    const result = compileScript(descriptor, { id })
    const { name, lang, noDefaultName, inheritAttrs } = result.attrs
    const shouldDefineName = name || !noDefaultName
    if (shouldDefineName || inheritAttrs) {
      s.appendLeft(
        0,
        `<script ${lang ? `lang="${lang}"` : ''}>
import { defineComponent } from 'vue'
// id: ${relative(process.cwd(), id)}
export default defineComponent({
  ${shouldDefineName ? `name: "${name || componentNameResolvers[type](id)}",` : ''}
  ${inheritAttrs ? `inheritAttrs: ${inheritAttrs !== 'false'},` : ''}
})
</script>\n`,
      )
    }

    const map = s.generateMap({ hires: true })
    const filename = FILENAME_RE.exec(id)![1]

    map.file = filename
    map.sources = [filename]

    return {
      map,
      code: s.toString(),
    }
  }
  else {
    return null
  }
}
