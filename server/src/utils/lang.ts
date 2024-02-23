import * as ts from 'typescript'

/**
 * compile typescript code to javascript
 * @param source typescript source code
 */
export function compileTs2js(source: string, name: string) {
  const jscode = ts.transpile(
    source,
    {
      module: ts.ModuleKind.Node16,
      target: ts.ScriptTarget.ES2022,
      removeComments: true,
      inlineSourceMap: true,
    },
    `${name}.ts`,
    undefined,
    name,
  )

  return jscode
}

/**
 * Deeply freeze object recursively
 * @param object
 * @returns
 */
export function deepFreeze<T>(object: T) {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object)

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name]

    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  }

  return Object.freeze(object)
}
