import { Request, Response, Router } from 'express'
import { checkPermission } from '../../api/permission'
import { FunctionContext, CloudFunction } from 'cloud-function-engine'
import * as multer from 'multer'
import * as path from 'path'
import * as uuid from 'uuid'
import { getFunctionByName } from '../../api/function'
import { Globals } from '../../lib/globals'

// 设置云函数中的加载函数
CloudFunction.require_func = Globals.require_func

const db = Globals.db
const logger = Globals.logger

export const FunctionRouter = Router()

// multer 上传配置
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, uuid.v4() + ext)
    }
  })
})

/**
 * 使用 invoke 前缀调用云函数，支持文件上传
 */
FunctionRouter.post('/invoke/:name', uploader.any(), handleInvokeFunction)

/**
 * 默认调用云函数，不支持文件上传
 */
FunctionRouter.all('/:name', handleInvokeFunction)         // alias for /invoke/:name

/**
 * 调用云函数
 * @param req 
 * @param res 
 * @returns 
 */
async function handleInvokeFunction(req: Request, res: Response) {
  const requestId = req['requestId']
  const func_name = req.params?.name

  logger.info(`[${requestId}] /func/${func_name} body: `, req.body)

  if (!func_name) {
    return res.send({ code: 1, error: 'invalid function name', requestId })
  }

  const debug = req.query?.debug ?? false

  // 调试权限验证
  if (debug) {
    const code = await checkPermission(req['auth']?.uid, 'function.debug')
    if (code) {
      return res.status(code).send('permission denied')
    }
  }

  const funcData = await getFunctionByName(func_name)
  if (!funcData) {
    return res.send({ code: 1, error: 'function not found', requestId })
  }
  
  const func = new CloudFunction(funcData)

  // 未启用 HTTP 访问则拒绝访问（调试模式除外）
  if (!func.enableHTTP && !debug) {
    return res.status(404).send('Not Found')
  }

  // 函数停用则拒绝访问（调试模式除外）
  if (1 !== func.status && !debug) {
    return res.status(404).send('Not Found')
  }

  // 如果是调试模式或者函数未编译，则编译并更新函数
  if(debug || !func.compiledCode) {
    func.compile2js()

    await db.collection('functions')
      .doc(func.id)
      .update({ compiledCode: func.compiledCode, updated_at: Date.now()})
  }

  // 调用函数
  const ctx: FunctionContext = {
    query: req.query,
    files: req.files as any,
    body: req.body,
    headers: req.headers,
    method: req.method,
    auth: req['auth'],
    requestId,
  }
  const result = await func.invoke(ctx)

  // 将云函数调用日志存储到数据库
  if(debug) {
    await db.collection('function_logs')
      .add({
        requestId: requestId,
        func_id: func.id,
        func_name: func_name,
        logs: result.logs,
        time_usage: result.time_usage,
        created_at: Date.now(),
        updated_at: Date.now(),
        created_by: req['auth']?.uid
      })
  }

  // 调用出错
  if (result.error) {
    logger.info(`[${requestId}] /func/${func_name} invoke error: `, result.error.message)
    logger.error(`[${requestId}] /func/${func_name} invoke error: `, result)
    return res.send({
      error: 'invoke function occurs error',
      logs: debug ? result.logs : undefined,
      time_usage: debug ? result.time_usage : undefined,
      requestId
    })
  }

  logger.trace(`[${requestId}] /func/${func_name} invoke success: `, result)

  // 调用成功返回
  return res.send({
    requestId,
    data: result.data,
    time_usage: debug ? result.time_usage : undefined,
    logs: debug ? result.logs : undefined
  })
}