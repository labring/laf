/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2022-01-13 13:55:07
 * @Description: 
 */

import { ApplicationStruct, getApplicationDbAccessor } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { permissions } from '../../permissions'
import { Request, Response } from 'express'


/**
 * Create index to collection
 */
export async function handleCreateIndex(req: Request, res: Response) {

  const collectionName = req.query?.collection
  if (!collectionName) {
    return res.status(422).send('collection cannot be empty')
  }

  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, permissions.DATABASE_MANAGE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const unique = req.body?.unique ?? false
  const spec = req.body.spec
  if (!validIndexSpec(spec)) {
    return res.status(422).send('invalid index spec')
  }

  const accessor = await getApplicationDbAccessor(app)
  try {
    const r = await accessor.db
      .collection(collectionName as string)
      .createIndex(spec, {
        background: true,
        unique: unique as boolean
      })
    await accessor.close()
    return res.send(r)
  } catch (error) {
    await accessor.close()
    return res.status(400).send(error)
  }
}


/**
 * check if index spec valid
 * @param spec 
 * @returns 
 */
function validIndexSpec(spec: any) {
  if (!spec) return false
  if (typeof spec !== 'object') {
    return false
  }

  const keys = Object.keys(spec)
  if (!keys || !keys.length) {
    return false
  }

  for (const k of keys) {
    if (typeof k !== 'string') return false
    if (k === '_id') return false

    if ([1, -1].includes(spec[k]) === false) {
      return false
    }
  }

  return true
}