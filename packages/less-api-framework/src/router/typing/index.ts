import * as express from 'express'
import { Globals } from '../../lib/globals'
import { PackageDeclaration, NodePackageDeclarations } from 'npm-utils'
import path = require('path')

export const PackageTypingRouter = express.Router()
const logger = Globals.logger

const nodeModulesRoot = path.resolve(__dirname, '../../../node_modules')


/**
 * 获取一个依赖声明文件列表, query 版
 */
 PackageTypingRouter.get('/package', async (req, res) => {
  const requestId = req['requestId']
  logger.info(`[${requestId}] get /typing/package`)

  const packageName = req.query.packageName as string
  if(!packageName) {
    return res.status(422).send('invalid package name')
  }

  // 处理 node 包
  if(packageName === '@types/node') {
    const pkr = new NodePackageDeclarations(nodeModulesRoot)
    const rets = []
    for(const name of NodePackageDeclarations.NODE_PACKAGES) {
      const r = await pkr.getNodeBuiltinPackage(name)
      rets.push(r)
    }

    return res.send({
      code: 0, 
      data: rets
    })
  }

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
