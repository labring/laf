const fse = require('fs-extra')
const path = require('path')


/**
 * 在 node_modules 中创建 云函数 sdk 包：@， 这个包是为了云函数IDE 加载类型提示文件而创建的，不可发布
 */
function createCloudFunctionDeclarationPackage() {
  const source = path.resolve(__dirname, '../dist')
  const target = path.resolve(__dirname, '../node_modules/@')

  fse.ensureDirSync(target)
  fse.copySync(source, target)

  console.log(`copy success: ${source} => ${target}`)

  const packageJson = `
  {
    "name": "@",
    "version": "0.0.0"
  }
  `
  const pkgJsonPath = path.join(target, 'package.json')
  fse.writeFileSync(pkgJsonPath, packageJson)

  console.log(`write success: ${pkgJsonPath}`)
}


createCloudFunctionDeclarationPackage()