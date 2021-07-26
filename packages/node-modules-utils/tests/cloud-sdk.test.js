
const assert = require('assert')
const path = require('path')
const { PackageDeclaration } = require('../dist')

const nmp = path.resolve(__dirname, '../../less-api-framework/node_modules')

describe('Package Declaration Load', () => {

  /**
   * load from self package: @
   */
   it('load d.ts of @ (typings)', async () => {
    const pkg = new PackageDeclaration('@', nmp)
    await pkg.load()
    console.log(pkg.declarations)
     
    assert.strictEqual(pkg.name, '@')
    assert.ok(pkg.declarations.length > 0)
  })
})