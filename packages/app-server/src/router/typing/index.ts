import * as express from 'express'
import { Globals } from '../../lib/globals/index'
import { PackageDeclaration, NodePackageDeclarations } from 'node-modules-utils'
import path = require('path')

export const PackageTypingRouter = express.Router()
const logger = Globals.logger

const nodeModulesRoot = path.resolve(__dirname, '../../../node_modules')


/**
 * 获取一个依赖声明文件列表
 */
PackageTypingRouter.get('/package', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] get /typing/package`)

  const packageName = req.query.packageName as string
  if (!packageName) {
    return res.status(422).send('invalid package name')
  }

  // 获取所有 node 内置包类型
  if (packageName === '@types/node') {
    const pkr = new NodePackageDeclarations(nodeModulesRoot)
    const rets = []
    for (const name of NodePackageDeclarations.NODE_PACKAGES) {
      const r = await pkr.getNodeBuiltinPackage(name)
      rets.push(r)
    }

    return res.send({
      code: 0,
      data: rets
    })
  }

  // 获取指定 node 内置包类型
  if (NodePackageDeclarations.NODE_PACKAGES.includes(packageName)) {
    const pkr = new NodePackageDeclarations(nodeModulesRoot)
    const r = await pkr.getNodeBuiltinPackage(packageName)

    return res.send({
      code: 0,
      data: [r]
    })
  }

  // 获取其它三方包类型
  const pkd = new PackageDeclaration(packageName, nodeModulesRoot)
  await pkd.load()
  return res.send({
    code: 0,
    data: pkd.declarations
  })
})



// /**
//  * 获取 node 所有官方包的声明文件
//  */
// async function getAllNodeBuiltinPackages() {
//   const pkr = new NodePackageDeclarations(nodeModulesRoot)

// }
