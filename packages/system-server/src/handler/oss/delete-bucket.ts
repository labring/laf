/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-13 17:42:16
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { CN_APPLICATIONS } from '../../constants'
import { DatabaseAgent } from '../../db'
import { MinioAgent } from '../../support/minio'
import { StorageActionDef } from '../../actions'

/**
 * The handler of deleting a bucket
 */
export async function handleDeleteBucket(req: Request, res: Response) {
  const bucketName = req.params?.bucket

  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, StorageActionDef.DeleteBucket, app)
  if (code) {
    return res.status(code).send()
  }

  const oss = await MinioAgent.New()
  const internalName = `${app.appid}-${bucketName}`
  const ret = await oss.deleteBucket(internalName)
  if (ret?.$metadata?.httpStatusCode !== 204) {
    return res.send({ code: 'ERROR', data: ret?.$metadata })
  }

  // delete bucket from app
  await DatabaseAgent.db.collection<IApplicationData>(CN_APPLICATIONS)
    .updateOne({ appid: app.appid }, {
      $pull: {
        buckets: { name: bucketName }
      }
    })

  return res.send({
    code: 0,
    data: bucketName
  })
}