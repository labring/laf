/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-15 15:40:59
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { CN_OSS_SERVICE_ACCOUNT } from '../../constants'
import { DatabaseAgent } from '../../db'
import { MinioAgent } from '../../support/minio'
import { logger } from '../../support/logger'
import { StorageActionDef } from '../../actions'

/**
 * The handler of creating a bucket
 */
export async function handleUpdateServiceAccount(req: Request, res: Response) {


  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']
  // check permission
  const code = await checkPermission(uid, StorageActionDef.CreateServiceAccount, app)
  if (code) {
    return res.status(code).send()
  }

  const sa = await DatabaseAgent.db.collection(CN_OSS_SERVICE_ACCOUNT)
    .findOne({ appid: app.appid, status: 1 })

  const oss = await MinioAgent.New()
  if (sa) {
    const r0 = await oss.removeServiceAccount(sa.access_key)
    if (r0.status === 'error') {
      logger.error(r0)
      return res.status(400).send('Error: remove oss service account failed')
    }

    await DatabaseAgent.db.collection(CN_OSS_SERVICE_ACCOUNT)
      .updateOne({ appid: app.appid, _id: sa._id }, {
        $set: {
          "status": 0,
          "updated_at": new Date()
        }
      })
  }

  const r1 = await oss.addServiceAccount(app.appid)
  if (r1.status === 'error') {
    logger.error(r1)
    return res.status(400).send('Error: create oss service account failed')
  }

  const data = {
    appid: app.appid,
    status: 1,
    access_key: r1.accessKey,
    access_secret: r1.secretKey,
    created_at: new Date(),
    updated_at: new Date(),
  }

  // save it
  const r = await DatabaseAgent.db.collection(CN_OSS_SERVICE_ACCOUNT)
    .insertOne(data as any)

  if (!r.insertedId) {
    return res.status(500).send('Error: create oss service account failed')
  }

  return res.send({
    code: 0,
    data
  })





}