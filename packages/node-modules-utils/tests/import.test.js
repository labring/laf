
const assert = require('assert')
const path = require('path')
const { ImportParser, PackageDeclaration } = require('../dist')

const nmp = path.resolve(__dirname, '../../app-service/node_modules')

describe('npm-util(unit): Import Parser', () => {
  
   it('parse database-proxy index.d.ts', async () => {
     const pkg = new PackageDeclaration('database-proxy', nmp)
     await pkg.load()
     const dec0 = pkg.declarations[0]
    //  console.log(dec0.packageName, dec0.path)
     
     const parser = new ImportParser()
     const r = parser.parseDependencies(dec0.content, dec0.path)
     
    //  console.log(r)
     assert.ok(r.length > 0)
     assert.strictEqual(pkg.name, 'database-proxy')
     assert.ok(pkg.declarations.length > 0)
  })
})