/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-13 19:35:34
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData } from '../../support/application'
import { MinioAgent } from '../../support/minio'
import { checkPermission } from '../../support/permission'
import Config from '../../config'
import { StorageActionDef } from '../../actions'

/**
 * The handler of getting bucket lists of an application
 */
export async function handleGetBuckets(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, StorageActionDef.ListBuckets, app)
  if (code) {
    return res.status(code).send()
  }

  return res.send({
    code: 0,
    data: app.buckets || []
  })
}

/**
 * The handler of getting bucket detail of an application
 */
export async function handleGetOneBucket(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']
  const name = req.params.bucket

  // check permission
  const code = await checkPermission(uid, StorageActionDef.GetBucket, app)
  if (code) {
    return res.status(code).send()
  }

  // check bucket exists
  const [bucket] = (app.buckets || []).filter(bk => bk.name === name)
  if (!bucket) {
    return res.status(404).send('bucket not found')
  }

  // bucket tokens
  const exp = 60 * 60 * Config.TOKEN_EXPIRED_TIME
  const oss = await MinioAgent.New()
  const sts = await oss.getApplicationSTS(app, exp)

  const internal_name = `${app.appid}-${name}`
  const stats = await oss.statsBucket(internal_name)
  const data = {
    name,
    mode: bucket.mode,
    quota: bucket.quota,
    objects: stats.objects,
    size: stats.size,
    credentials: {
      accessKeyId: sts.Credentials?.AccessKeyId,
      secretAccessKey: sts.Credentials?.SecretAccessKey,
      sessionToken: sts.Credentials?.SessionToken,
      expiration: sts.Credentials?.Expiration
    }
  }

  return res.send({
    code: 0,
    data
  })
}