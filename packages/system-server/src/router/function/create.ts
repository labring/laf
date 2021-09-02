/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-01 13:07:07
 * @LastEditTime: 2021-09-02 16:52:54
 * @Description: 
 */

import { compileTs2js } from 'cloud-function-engine/dist/utils'
import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'
import { hashFunctionCode } from '../../utils/hash'

const { FUNCTION_ADD } = permissions

/**
 * Create function
 */
export async function handleCreateFunction(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.sys_db
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, FUNCTION_ADD.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check params
  const body = req.body
  if (!body.name) return res.status(422).send('name cannot be empty')
  if (!body.code) return res.status(422).send('code cannot be empty')

  // function name should be unique
  const { total } = await db.collection(Constants.cn.functions)
    .where({ name: body.name, appid: app.appid })
    .count()
  if (total) return res.status(422).send('function name already exists')

  // build the func data
  const func = {
    name: body.name,
    code: body.code,
    enableHTTP: body.enableHTTP ?? false,
    status: body.status ?? 0,
    compiledCode: compileTs2js(body.code),
    tags: body.tags ?? [],
    label: body.label ?? 'New Function',
    version: 0,
    hash: hashFunctionCode(body.code),
    created_at: Date.now(),
    updated_at: Date.now(),
    created_by: uid,
    appid: app.appid
  }

  // add cloud function
  const ret = await db.collection(Constants.cn.functions)
    .add(func)

  // @TODO check ret.error 

  return res.send({ data: ret })
}