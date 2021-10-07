/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-10-08 01:29:21
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../lib/db-agent'
import { permissions } from '../../constants/permissions'
import { DockerContainerServiceDriver } from '../../lib/service-driver/container'

const { APPLICATION_UPDATE } = permissions
/**
 * The handler of starting application
 */
export async function handleStartApplicationService(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)

  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, APPLICATION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const dockerService = new DockerContainerServiceDriver()
  const container_id = await dockerService.startService(app)

  await db.collection(Constants.cn.applications)
    .updateOne(
      { appid: app.appid },
      {
        $set: { status: 'running' }
      }
    )

  return res.send({
    data: {
      service_id: container_id,
      appid: app.appid
    }
  })
}


/**
 * The handler of stopping application
 */
export async function handleStopApplicationService(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)

  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, APPLICATION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const dockerService = new DockerContainerServiceDriver()
  const container_id = await dockerService.stopService(app)

  await db.collection(Constants.cn.applications)
    .updateOne(
      { appid: app.appid },
      {
        $set: { status: 'stopped' }
      })

  return res.send({
    data: {
      service_id: container_id,
      appid: app.appid
    }
  })
}


/**
 * The handler of removing application
 */
export async function handleRemoveApplicationService(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)

  if (!app)
    return res.status(422).send('app not found')

  // check permission
  const code = await checkPermission(uid, APPLICATION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const dockerService = new DockerContainerServiceDriver()
  const container_id = await dockerService.removeService(app)

  await db.collection(Constants.cn.applications)
    .updateOne(
      { appid: app.appid },
      { $set: { status: 'cleared' } }
    )

  return res.send({
    data: {
      service_id: container_id,
      appid: app.appid
    }
  })
}