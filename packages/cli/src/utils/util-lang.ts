
import * as ts from 'typescript'


/**
 * compile typescript code to javascript
 * @param source typescript source code
 */
export function compileTs2js(source: string) {
  const jscode = ts.transpile(source, {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017,
    removeComments: true,
  })

  return jscode
}