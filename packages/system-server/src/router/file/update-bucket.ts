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
import { StorageAgent } from '../../api/storage'
import { DatabaseAgent } from '../../lib/db-agent'

/**
 * The handler of updating a bucket
 */
export async function handleUpdateBucket(req: Request, res: Response) {
  const bucketName = req.params?.bucket
  const mode = req.body?.mode
  if (![0, 1, 2].includes(mode)) {
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

  const st = new StorageAgent()
  const internalName = `${app.appid}_${bucketName}`
  const ret = await st.updateBucket(internalName, mode)
  if (ret?.code !== 0) {
    return res.send(ret)
  }

  // update bucket to app
  await DatabaseAgent.db.collection<ApplicationStruct>(Constants.cn.applications)
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