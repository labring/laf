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
import { parseToken } from '../support/token'
import { FunctionCache } from '../support/engine'
import Config from '../config'
import * as fs from 'fs'

const nodeModulesRoot = path.resolve(__dirname, '../../node_modules')

/**
 * Gets declaration files of a dependency package
 */
export async function handlePackageTypings(req: IRequest, res: Response) {
  // verify the debug token
  const token = req.get('x-laf-develop-token')
  if (!token) {
    return res.status(400).send('x-laf-develop-token is required')
  }
  const auth = parseToken(token) || null
  if (auth?.type !== 'develop') {
    return res.status(403).send('permission denied: invalid develop token')
  }

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
    const func = FunctionCache.get(packageName.replace('@/', ''))
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

  // get custom dependency types
  const customDependencyPath = `${Config.CUSTOM_DEPENDENCY_BASE_PATH}/node_modules/`
  if (fs.existsSync(`${customDependencyPath}/${packageName}`)) {
    getThreePartyPackageTypings(req, res, customDependencyPath, packageName)
  } else {
    getThreePartyPackageTypings(req, res, nodeModulesRoot, packageName)
  }
}

async function getThreePartyPackageTypings(
  req: IRequest,
  res: Response,
  basePath: string,
  packageName: string,
) {
  const requestId = req['requestId']
  try {
    // Gets other three-party package types
    const pkd = new PackageDeclaration(packageName, basePath)
    await pkd.load()
    return res.send({
      code: 0,
      data: pkd.declarations,
    })
  } catch (error) {
    if (!Config.isProd) {
      logger.error(requestId, 'failed to get package typings', error)
    }

    return res.send({
      code: 1,
      error: error.toString(),
    })
  }
}
