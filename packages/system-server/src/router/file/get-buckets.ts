/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-13 19:35:34
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import Config from '../../config'
import { Constants } from '../../constants'
import { getToken } from '../../utils/token'

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
  const exp = ~~(Date.now() / 1000 + 60 * 60 * Config.TOKEN_EXPIRED_TIME)
  const internalName = `${app.appid}_${name}`
  const read_token = getToken({ ns: internalName, op: 'r', exp }, app.config.server_secret_salt)
  const full_token = getToken({ ns: internalName, op: 'rwdl', exp }, app.config.server_secret_salt)

  const data = {
    name,
    mode: bucket.mode,
    read_token,
    full_token
  }

  return res.send({
    code: 0,
    data
  })
}