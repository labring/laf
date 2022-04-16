/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-13 19:35:34
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { MinioAgent } from '../../api/oss'
import { checkPermission } from '../../api/permission'
import Config from '../../config'
import { Constants } from '../../constants'

/**
 * The handler of getting bucket lists of an application
 */
export async function handleGetBuckets(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const { FILE_READ } = Constants.permissions
  const code = await checkPermission(uid, FILE_READ.name, app)
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
  const app: ApplicationStruct = req['parsed-app']
  const name = req.params.bucket

  // check permission
  const { FILE_READ } = Constants.permissions
  const code = await checkPermission(uid, FILE_READ.name, app)
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
  const data = {
    name,
    mode: bucket.mode,
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