

const vm = require('vm')
const path = require('path')

const code = `
import s from 'foo'
import { basename } from 'path'
import * as fs from 'fs'
print(basename)
print(fs.readFile)
s
`
const contextifiedObject = vm.createContext({
  secret: 42,
  print: console.log,
  require: require
});



async function linker(specifier, referencingModule, defaultImport) {
  if (specifier === 'foo') {
    return new vm.SourceTextModule(`
      // The "secret" variable refers to the global variable we added to
      // "contextifiedObject" when creating the context.
      export default secret;
    `, { context: referencingModule.context });
  }
  // if (specifier === 'path') {
    const mod = require(specifier)
    return new vm.SourceTextModule(
      Object.keys(mod)
        .map((x) => `export const ${x} = import.meta.mod.${x};`)
        .join('\n'),
      {
        initializeImportMeta(meta) {
          meta.mod = mod;
        },
        context: referencingModule.context
      }
    );
  // }
  throw new Error(`Unable to resolve dependency: ${specifier}`);
}

async function main() {
  const bar = new vm.SourceTextModule(code, { context: contextifiedObject });
  await bar.link(linker);
  const r = await bar.evaluate();
  console.log({r})
}

main()