/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-15 15:40:59
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { BUCKET_QUOTA_MIN, CN_APPLICATIONS, REGEX_BUCKET_NAME } from '../../constants'
import { DatabaseAgent } from '../../db'
import { BUCKET_ACL, MinioAgent } from '../../support/minio'
import { OssSupport } from '../../support/oss'
import { StorageActionDef } from '../../actions'

/**
 * The handler of creating a bucket
 */
export async function handleCreateBucket(req: Request, res: Response) {
  const bucketName = req.body?.bucket ?? ''
  if (!REGEX_BUCKET_NAME.test(bucketName)) {
    return res.status(422).send('invalid bucket name')
  }

  const mode: BUCKET_ACL = req.body?.mode
  if (!MinioAgent.BUCKET_ACLS.includes(mode)) {
    return res.status(422).send('invalid bucket mode')
  }

  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  let quota: number = req.body?.quota || 0
  if (quota < BUCKET_QUOTA_MIN) { quota = BUCKET_QUOTA_MIN }

  const avaliable_quota = await OssSupport.getAppAvaliableCapacity(app.appid)
  if (quota > avaliable_quota) {
    return res.send({
      code: 'NO_SUFFICIENT_CAPACITY',
      error: 'NO_SUFFICIENT_CAPACITY'
    })
  }

  // check permission
  const code = await checkPermission(uid, StorageActionDef.CreateBucket, app)
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
  const ret = await oss.createBucket(internalName, { acl: mode, quota, with_lock: false })
  if (!ret) {
    return res.status(400).send('create bucket failed')
  }

  // add to app
  await DatabaseAgent.db.collection<IApplicationData>(CN_APPLICATIONS)
    .updateOne({ appid: app.appid }, {
      $push: {
        buckets: { name: bucketName, mode, quota }
      }
    })

  return res.send({
    code: 0,
    data: bucketName
  })
}