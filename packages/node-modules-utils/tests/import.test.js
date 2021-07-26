
const assert = require('assert')
const path = require('path')
const { ImportParser, PackageDeclaration } = require('../dist')

const nmp = path.resolve(__dirname, '../../less-api-framework/node_modules')

describe('Import Parser', () => {
  
   it('parse less-api-database index.d.ts', async () => {
     const pkg = new PackageDeclaration('less-api-database', nmp)
     await pkg.load()
     const dec0 = pkg.declarations[0]
     console.log(dec0.packageName, dec0.path)
     
     const parser = new ImportParser()
     const r = parser.parseDependencies(dec0.content, dec0.path)
     
     console.log(r)
     assert.ok(r.length > 0)
     assert.strictEqual(pkg.name, 'less-api-database')
     assert.ok(pkg.declarations.length > 0)
  })
})