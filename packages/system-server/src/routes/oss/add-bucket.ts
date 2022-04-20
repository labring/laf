/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-15 15:40:59
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../db'
import { BUCKET_ACL, MinioAgent } from '../../api/oss'

/**
 * The handler of creating a bucket
 */
export async function handleCreateBucket(req: Request, res: Response) {
  const bucketName = req.body?.bucket
  if (!bucketName) {
    return res.status(422).send('invalid bucket name')
  }

  const mode: BUCKET_ACL = req.body?.mode
  if (!MinioAgent.BUCKET_ACLS.includes(mode)) {
    return res.status(422).send('invalid bucket mode')
  }

  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const { FILE_BUCKET_ADD } = Constants.permissions
  const code = await checkPermission(uid, FILE_BUCKET_ADD.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check bucket name exists
  const [existed] = (app.buckets || []).filter(bk => bk.name === bucketName)
  if (existed) {
    return res.status(200).send({ code: 'EXISTED', error: 'bucket name already existed' })
  }

  const oss = await MinioAgent.New()
  const internalName = `${app.appid}-${bucketName}`
  const ret = await oss.createBucket(internalName, mode)
  if (!ret) {
    return res.status(400).send('create bucket failed')
  }

  // add to app
  await DatabaseAgent.db.collection<ApplicationStruct>(Constants.colls.applications)
    .updateOne({ appid: app.appid }, {
      $push: {
        buckets: { name: bucketName, mode }
      }
    })

  return res.send({
    code: 0,
    data: bucketName
  })
}