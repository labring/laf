/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:26:26
 * @LastEditTime: 2022-01-13 13:52:29
 * @Description: 
 */

import { IApplicationData, getApplicationDbAccessor } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { DatabaseActionDef } from '../../actions'
import { Request, Response } from 'express'


/**
 * Update collection
 */
export async function handleUpdateCollection(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, DatabaseActionDef.UpdateCollection, app)
  if (code) {
    return res.status(code).send()
  }

  const collectionName = req.body?.collectionName
  if (!collectionName) {
    return res.status(422).send('collection name got empty')
  }

  const options = req.body?.options || {}
  const accessor = await getApplicationDbAccessor(app)

  const db = accessor.db
  const command = {
    collMod: collectionName,
    validationAction: 'error'
  }

  if (options?.validatorSchema) {
    command['validator'] = {
      $jsonSchema: options.validatorSchema
    }
  }

  if (['strict', 'off', 'moderate'].includes(options?.validationLevel)) {
    command['validationLevel'] = options.validationLevel
  } else {
    command['validationLevel'] = 'strict'
  }

  try {
    await db.command(command)
    await accessor.close()
    return res.send({ code: 0, data: 'ok' })
  } catch (error) {
    await accessor.close()
    return res.status(400).send({
      error: error.message,
      code: error.codeName
    })
  }
}