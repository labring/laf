
const assert = require('assert')
const path = require('path')
const { PackageDeclaration } = require('../dist')

const nmp = path.resolve(__dirname, '../../app-service/node_modules')

describe('npm-util(unit): Package Declaration Load', () => {
  /**
   * load from @types/express
   */
  it('load d.ts of express', async () => {
    const pkg = new PackageDeclaration('express', nmp)
    await pkg.load()
    assert.strictEqual(pkg.name, 'express')
    assert.ok(pkg.declarations.length > 0)
  })

  /**
   * load from self package (typings): axios
   */
  it('load d.ts of axios (typings)', async () => {
    const pkg = new PackageDeclaration('axios', nmp)
    await pkg.load()
    assert.strictEqual(pkg.name, 'axios')
    assert.ok(pkg.declarations.length > 0)
  })

  /**
   * load from self package (typings): moment, which typings is not 'index.d.ts'
   */
   it('load d.ts of moment (typings)', async () => {
    const pkg = new PackageDeclaration('moment', nmp)
    await pkg.load()
    assert.strictEqual(pkg.name, 'moment')
    assert.ok(pkg.declarations.length > 0)
   })
  
  /**
   * load from self package: database-proxy
   */
   it('load d.ts of database-proxy (typings)', async () => {
    const pkg = new PackageDeclaration('database-proxy', nmp)
     await pkg.load()
    // console.log(pkg.declarations)
     
    assert.strictEqual(pkg.name, 'database-proxy')
    assert.ok(pkg.declarations.length > 0)
   })
  
  /**
   * load from self package: alipay-sdk
   */
   it('load d.ts of alipay-sdk (typings)', async () => {
    const pkg = new PackageDeclaration('alipay-sdk', nmp)
     await pkg.load()
    // console.log(pkg)
     
    assert.strictEqual(pkg.name, 'alipay-sdk')
    assert.ok(pkg.declarations.length > 0)
  })
})