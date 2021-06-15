import { Request, Response, Router } from 'express'
import { db } from '../../lib/db'
import { checkPermission } from '../../lib/api/permission'
import { getLogger } from '../../lib/logger'
import { getCloudFunction, invokeFunction } from '../../lib/faas/invoke'
import { FunctionContext } from '../../lib/faas/types'
import * as multer from 'multer'
import * as path from 'path'
import * as uuid from 'uuid'


export const FunctionRouter = Router()
const logger = getLogger('admin:api')

// multer 上传配置
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, uuid.v4() + ext)
    }
  })
})

FunctionRouter.post('/invoke/:name', uploader.any(), handleInvokeFunction)
FunctionRouter.all('/:name', uploader.any(), handleInvokeFunction)         // alias for /invoke/:name

async function handleInvokeFunction(req: Request, res: Response) {
  const requestId = req['requestId']
  const func_name = req.params?.name

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

  logger.info(`[${requestId}] /func/${func_name} body: `, req.body)

  // 获取函数
  const func = await getCloudFunction(func_name)

  if (!func) {
    return res.send({ code: 1, error: 'function not found', requestId })
  }

  if (!func.enableHTTP && !debug) {
    return res.status(404).send('Not Found')
  }

  if (1 !== func.status && !debug) {
    return res.status(404).send('Not Found')
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
  const result = await invokeFunction(func, ctx)

  // 将云函数调用日志存储到数据库
  {
    await db.collection('function_logs')
      .add({
        requestId: requestId,
        func_id: func._id,
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
    logger.trace(`[${requestId}] /func/${func_name} invoke error: `, result)
    return res.send({
      code: 1,
      error: 'invoke function occurs error',
      logs: debug ? result.logs : undefined,
      time_usage: debug ? result.time_usage : undefined,
      requestId
    })
  }

  logger.trace(`[${requestId}] /func/${func_name} invoke success: `, result)

  // 调用成功返回
  return res.send({
    code: 0,
    requestId,
    data: result.data,
    time_usage: debug ? result.time_usage : undefined,
    logs: debug ? result.logs : undefined
  })
}