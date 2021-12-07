/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-05 02:11:39
 * @LastEditTime: 2021-12-07 22:33:13
 * @Description: 
 */


import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ApplicationStruct } from '../../api/application'
import { getFunctionById } from '../../api/function'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'
import { hashFunctionCode } from '../../utils/hash'
import { compileTs2js } from '../../utils/lang'

const { FUNCTION_UPDATE, FUNCTION_DEBUG } = permissions

/**
 * Update function's basic info
 */
export async function handleUpdateFunction(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const app: ApplicationStruct = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(uid, FUNCTION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const body = req.body

  // function name should be unique
  if (body.name) {
    const total = await db.collection(Constants.cn.functions)
      .countDocuments({
        _id: {
          $ne: new ObjectId(func_id)
        },
        name: body.name,
        appid: app.appid
      })

    if (total) return res.status(422).send('function name already exists')
  }

  const func = await db.collection(Constants.cn.functions)
    .findOne({
      _id: new ObjectId(func_id),
      appid: app.appid
    })

  if (!func) return res.status(422).send('function not found')

  // build the func data
  const data = {
    name: body.name ?? func.name,
    description: body.description ?? func.description,
    enableHTTP: body.enableHTTP ?? func.enableHTTP,
    status: body.status ?? func.status,
    tags: body.tags ?? func.tags,
    label: body.label ?? func.label,
    updated_at: new Date()
  }

  // update cloud function
  const ret = await db.collection(Constants.cn.functions)
    .updateOne({
      _id: new ObjectId(func_id),
      appid: app.appid
    }, {
      $set: data,
      $inc: { version: 1 }
    })

  return res.send({ data: ret })
}


/**
 * Update function's code
 */
export async function handleUpdateFunctionCode(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const app: ApplicationStruct = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(uid, FUNCTION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const body = req.body
  if (!body.code) return res.status(422).send('code cannot be empty')

  const func = await getFunctionById(app.appid, new ObjectId(func_id))
  if (!func) return res.status(422).send('function not found')

  // build the func data
  const data = {
    code: body.code,
    compiledCode: compileTs2js(body.code),
    hash: hashFunctionCode(body.code),
    debugParams: body.debugParams || func.debugParams,
    updated_at: new Date()
  }

  // update cloud function
  await db.collection(Constants.cn.functions)
    .updateOne({
      _id: new ObjectId(func_id),
      appid: app.appid
    }, {
      $set: data,
      $inc: { version: 1 }
    })

  const doc = await getFunctionById(app.appid, new ObjectId(func_id))

  // record the function change history
  if (doc.hash !== func.hash) {
    const record = Object.assign({}, doc)
    await db.collection(Constants.cn.function_history)
      .insertOne({
        appid: app.appid,
        func_id: func._id,
        data: record,
        created_at: new Date(),
        created_by: new ObjectId(uid),
      })
  }

  return res.send({ data: doc })
}

/**
 * Compile function's code
 */
export async function handleCompileFunctionCode(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(uid, FUNCTION_DEBUG.name, app)
  if (code) {
    return res.status(code).send()
  }

  const body = req.body
  if (!body.code) return res.status(422).send('code cannot be empty')

  const func = await getFunctionById(app.appid, new ObjectId(func_id))
  if (!func) return res.status(422).send('function not found')

  // build the func data
  const data = {
    ...func,
    code: body.code,
    compiledCode: compileTs2js(body.code),
    hash: hashFunctionCode(body.code),
    debugParams: body.debugParams || func.debugParams,
    updated_at: new Date()
  }

  return res.send({ data: data })
}