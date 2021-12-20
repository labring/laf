
const assert = require('assert')
const { PackageInfo} = require('../dist')
const path = require('path')
const nmp = path.resolve(__dirname, '../../app-service/node_modules')


describe('npm-util(unit): Package parse', () => {
  it('get pkg dir: database-ql', async () => {
    const pkg = new PackageInfo('database-ql', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'database-ql')
    // console.log(pkg.entryPath)
    assert(pkg.entryPath?.endsWith('dist/commonjs'))
  })

  it('get pkg dir: database-ql/index', async () => {
    const pkg = new PackageInfo('database-ql/index', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'database-ql')
    assert(pkg.entryPath?.endsWith('dist/commonjs'))
  })

  it('get pkg dir: database-ql/dist/commonjs', async () => {
    const pkg = new PackageInfo('database-ql/dist/commonjs', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'database-ql')
    assert(pkg.entryPath?.endsWith('dist/commonjs'))
  })

  it('get pkg dir: database-ql/dist/commonjs/commands/index', async () => {
    const pkg = new PackageInfo('database-ql/dist/commonjs/commands/index', nmp)
    await pkg.parse()
    assert.strictEqual(pkg.name, 'database-ql')
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
    // console.log(pkg)
    assert.strictEqual(pkg.name, '@types/express')
  })


  it('get pkg dir: alipay-sdk', async () => {
    const pkg = new PackageInfo('alipay-sdk', nmp)
    await pkg.parsePackageInfo()
    // console.log(pkg)
    assert.strictEqual(pkg.name, 'alipay-sdk')
  })
})