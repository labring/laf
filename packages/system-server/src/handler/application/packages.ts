/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-11-17 17:11:39
 * @LastEditTime: 2021-11-17 18:54:04
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData, getApplicationByAppid, publishApplicationPackages } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { CN_APPLICATIONS } from '../../constants'
import { DatabaseAgent } from '../../db'
import { FunctionActionDef } from '../../actions'

/**
 * Get packages from app
 */
export async function handleGetPackages(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.ListPackages, app)
  if (code) {
    return res.status(code).send()
  }

  const packages = app.packages ?? []
  return res.send({
    data: packages
  })
}

/**
 * Add a package to app
 */
export async function handleAddPackage(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const appid = req.params.appid
  const pkg_name = req.body?.name as string
  const pkg_version = req.body?.version
  if (!pkg_name) return res.status(422).send('package name cannot be empty')
  if (!pkg_version) return res.status(422).send('package version cannot be empty')

  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.CreatePackage, app)
  if (code) {
    return res.status(code).send()
  }

  // check if package existed
  const packages = app.packages ?? []
  const existed = packages?.filter(pkg => pkg.name === pkg_name)?.length
  if (existed) {
    return res.send({ code: 'ALREADY_EXISTED', error: 'package already existed' })
  }

  await db.collection<IApplicationData>(CN_APPLICATIONS)
    .updateOne(
      { appid: app.appid },
      {
        $push: {
          packages: { name: pkg_name, version: pkg_version }
        }
      })

  await publishApplicationPackages(app.appid)

  return res.send({
    data: 'ok'
  })
}

/**
 * Remove a package by name
 */
export async function handleRemovePackage(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const appid = req.params.appid
  const pkg_name = req.body?.name as string
  if (!pkg_name) return res.status(422).send('package name cannot be empty')

  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.DeletePackage, app)
  if (code) {
    return res.status(code).send()
  }

  // check if package exists
  const packages = app.packages ?? []
  const existed = packages?.filter(pkg => pkg.name === pkg_name)?.length
  if (!existed) {
    return res.send({ code: 'NOT_EXISTS', error: 'package not exists' })
  }

  await db.collection<IApplicationData>(CN_APPLICATIONS)
    .updateOne(
      { appid: app.appid },
      {
        $pull: {
          packages: { name: pkg_name }
        }
      })

  await publishApplicationPackages(app.appid)

  return res.send({
    data: 'ok'
  })
}

/**
 * Update a package by name
 */
export async function handleUpdatePackage(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const appid = req.params.appid
  const pkg_name = req.body?.name as string
  const pkg_version = req.body?.version
  if (!pkg_name) return res.status(422).send('package name cannot be empty')
  if (!pkg_version) return res.status(422).send('package version cannot be empty')

  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.UpdatePackage, app)
  if (code) {
    return res.status(code).send()
  }

  // check if package exists
  const packages = app.packages ?? []
  const existed = packages?.filter(pkg => pkg.name === pkg_name)?.length
  if (!existed) {
    return res.send({ code: 'NOT_EXISTS', error: 'package not exists' })
  }

  await db.collection<IApplicationData>(CN_APPLICATIONS)
    .updateOne(
      { appid: app.appid, 'packages.name': pkg_name },
      {
        $set: {
          'packages.$': { name: pkg_name, version: pkg_version }
        }
      })

  await publishApplicationPackages(app.appid)

  return res.send({
    data: 'ok'
  })
}