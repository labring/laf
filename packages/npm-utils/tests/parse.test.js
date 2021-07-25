
const assert = require('assert')
const { PackageInfo} = require('../dist')
const path = require('path')
const nmp = path.resolve(__dirname, '../../less-api-framework/node_modules')


describe('Package parse', () => {
  it('get pkg dir: less-api-database', async () => {
    const pkg = new PackageInfo('less-api-database', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'less-api-database')
    assert(pkg.entryPath?.endsWith('dist/commonjs'))
  })

  it('get pkg dir: less-api-database/index', async () => {
    const pkg = new PackageInfo('less-api-database/index', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'less-api-database')
    assert(pkg.entryPath?.endsWith('dist/commonjs'))
  })

  it('get pkg dir: less-api-database/dist/commonjs', async () => {
    const pkg = new PackageInfo('less-api-database/dist/commonjs', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'less-api-database')
    assert(pkg.entryPath?.endsWith('dist/commonjs'))
  })

  it('get pkg dir: less-api-database/dist/commonjs/commands/index', async () => {
    const pkg = new PackageInfo('less-api-database/dist/commonjs/commands/index', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'less-api-database')
    assert(pkg.entryPath?.endsWith('dist/commonjs'))
  })


  it('get pkg dir: axios', async () => {
    const pkg = new PackageInfo('axios', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'axios')
    assert(pkg.entryPath?.endsWith('axios'))
  })

  it('get pkg dir: @types/express', async () => {
    const pkg = new PackageInfo('@types/express', nmp)
    await pkg.parsePackageInfo()
    console.log(pkg)
    assert.strictEqual(pkg.name, '@types/express')
  })
})