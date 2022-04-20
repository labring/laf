/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-17 18:15:07
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../db'
import { BUCKET_ACL, MinioAgent } from '../../api/oss'

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
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const { FILE_BUCKET_ADD } = Constants.permissions
  const code = await checkPermission(uid, FILE_BUCKET_ADD.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check bucket name exists
  const [existed] = (app.buckets || []).filter(bk => bk.name === bucketName)
  if (!existed) {
    return res.status(404).send('bucket not found')
  }

  const oss = await MinioAgent.New()
  const internalName = `${app.appid}-${bucketName}`
  const ret = await oss.setBucketACL(internalName, mode)
  if (ret?.$metadata?.httpStatusCode !== 204) {
    return res.send({ code: 'ERROR', data: ret?.$metadata })
  }

  // update bucket to app
  await DatabaseAgent.db.collection<ApplicationStruct>(Constants.colls.applications)
    .updateOne({ appid: app.appid, 'buckets.name': bucketName }, {
      $set: {
        'buckets.$.mode': mode
      }
    })

  return res.send({
    code: 0,
    data: bucketName
  })
}