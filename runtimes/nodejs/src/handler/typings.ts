/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:49:35
 * @Description:
 */

import { Response } from 'express'
import { PackageDeclaration, NodePackageDeclarations } from 'node-modules-utils'
import path = require('path')
import { logger } from '../support/logger'
import { IRequest } from '../support/types'
import { FunctionCache } from '../support/function-engine/cache'

const nodeModulesRoot = path.resolve(__dirname, '../../node_modules')

/**
 * Gets declaration files of a dependency package
 */
export async function handlePackageTypings(req: IRequest, res: Response) {
  const requestId = req['requestId']

  const packageName = req.query.packageName as string
  if (!packageName) {
    return res.status(422).send('invalid package name')
  }

  // Get all node built-in packages' types
  if (packageName === '@types/node') {
    const pkr = new NodePackageDeclarations(nodeModulesRoot)
    const rets = []
    for (const name of NodePackageDeclarations.NODE_PACKAGES) {
      const r = await pkr.getNodeBuiltinPackage(name)
      rets.push(r)
    }

    return res.send({
      code: 0,
      data: rets,
    })
  }

  // Gets a node built-in package types
  if (NodePackageDeclarations.NODE_PACKAGES.includes(packageName)) {
    const pkr = new NodePackageDeclarations(nodeModulesRoot)
    const r = await pkr.getNodeBuiltinPackage(packageName)

    return res.send({
      code: 0,
      data: [r],
    })
  }

  // get cloud function types
  if (packageName.startsWith('@/')) {
    const func = FunctionCache.getFunctionByName(packageName.replace('@/', ''))
    const r = {
      packageName: packageName,
      content: func.source.code,
      path: `${packageName}/index.ts`,
      from: 'node',
    }
    return res.send({
      code: 0,
      data: [r],
    })
  }

  try {
    // Gets other three-party package types
    const pkd = new PackageDeclaration(packageName, nodeModulesRoot)
    await pkd.load()
    return res.send({
      code: 0,
      data: pkd.declarations,
    })
  } catch (error) {
    logger.error(requestId, 'failed to get package typings', error)
    return res.send({
      code: 1,
      error: error.toString(),
    })
  }
}
