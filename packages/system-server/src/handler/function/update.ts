/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-05 02:11:39
 * @LastEditTime: 2021-12-07 22:33:13
 * @Description: 
 */


import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { IApplicationData } from '../../support/application'
import { getFunctionById, getFunctionByName } from '../../support/function'
import { checkPermission } from '../../support/permission'
import { CN_FUNCTIONS, CN_FUNCTION_HISTORY } from '../../constants'
import { FunctionActionDef } from '../../actions'
import { DatabaseAgent } from '../../db'
import { hashFunctionCode } from '../../support/util-passwd'
import { compileTs2js } from '../../support/util-lang'


/**
 * Update function's basic info
 */
export async function handleUpdateFunction(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const app: IApplicationData = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.UpdateFunction, app)
  if (code) {
    return res.status(code).send()
  }

  const body = req.body

  // function name should be unique
  if (body.name) {
    const total = await db.collection(CN_FUNCTIONS)
      .countDocuments({
        _id: {
          $ne: new ObjectId(func_id)
        },
        name: body.name,
        appid: app.appid
      })

    if (total) return res.status(422).send('function name already exists')
  }

  const func = await db.collection(CN_FUNCTIONS)
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
  const ret = await db.collection(CN_FUNCTIONS)
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
  const app: IApplicationData = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.UpdateFunction, app)
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
  await db.collection(CN_FUNCTIONS)
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
    await db.collection(CN_FUNCTION_HISTORY)
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
 * Update function's code
 */
 export async function handleUpdateFunctionCodeByName(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const app: IApplicationData = req['parsed-app']
  const func_name = req.params.func_name

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.UpdateFunction, app)
  if (code) {
    return res.status(code).send()
  }

  const body = req.body
  if (!body.code) return res.status(422).send('code cannot be empty')

  const func = await getFunctionByName(app.appid, func_name)
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
  await db.collection(CN_FUNCTIONS)
    .updateOne({
      _id: func._id,
      appid: app.appid
    }, {
      $set: data,
      $inc: { version: 1 }
    })

  const doc = await getFunctionById(app.appid, func._id)

  // record the function change history
  if (doc.hash !== func.hash) {
    const record = Object.assign({}, doc)
    await db.collection(CN_FUNCTION_HISTORY)
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
  const app: IApplicationData = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.InvokeFunction, app)
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