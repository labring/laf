/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-17 18:15:07
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { BUCKET_QUOTA_MIN, CN_APPLICATIONS } from '../../constants'
import { DatabaseAgent } from '../../db'
import { BUCKET_ACL, MinioAgent } from '../../support/minio'
import { OssSupport } from '../../support/oss'
import { StorageActionDef } from '../../actions'

/**
 * The handler of updating a bucket
 */
export async function handleSetBucketPolicy(req: Request, res: Response) {
  const bucketName = req.params?.bucket
  const mode: BUCKET_ACL = req.body?.mode
  if (!MinioAgent.BUCKET_ACLS.includes(mode)) {
    return res.status(400).send('invalid mode value')
  }

  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, StorageActionDef.CreateBucket, app)
  if (code) {
    return res.status(code).send()
  }

  // check bucket name exists
  const [existed] = (app.buckets || []).filter(bk => bk.name === bucketName)
  if (!existed) {
    return res.status(404).send('bucket not found')
  }

  const internalName = `${app.appid}-${bucketName}`
  const oss = await MinioAgent.New()
  const stats = await oss.statsBucket(internalName)

  // check quota
  const avaliable_quota = await OssSupport.getAppAvaliableCapacity(app.appid)
  let quota: number = req.body?.quota || 0
  if (quota < BUCKET_QUOTA_MIN) { quota = BUCKET_QUOTA_MIN }
  const increased = quota - existed.quota
  // for increased case
  if (increased > avaliable_quota) {
    return res.send({ code: 'NO_SUFFICIENT_CAPACITY', error: 'NO_SUFFICIENT_CAPACITY' })
  }

  // for decreased case
  if (increased < 0 && quota < stats.size) {
    return res.send({ code: 'INVALID_PARAM', error: 'bucket quota cannot be less than the used size' })
  }

  // set bucket quota
  if (increased !== 0) {
    await oss.setBucketQuota(internalName, quota)
  }

  const ret = await oss.setBucketACL(internalName, mode)
  if (ret?.$metadata?.httpStatusCode !== 204) {
    return res.send({ code: 'ERROR', data: ret?.$metadata })
  }

  // update bucket to app
  await DatabaseAgent.db.collection<IApplicationData>(CN_APPLICATIONS)
    .updateOne({ appid: app.appid, 'buckets.name': bucketName }, {
      $set: {
        'buckets.$.mode': mode,
        'buckets.$.quota': quota
      }
    })

  return res.send({
    code: 0,
    data: bucketName
  })
}