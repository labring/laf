import { Request, Response, Router } from 'express'
import { db } from '../../lib/db'
import { checkPermission } from '../../lib/api/permission'
import { getLogger } from '../../lib/logger'
import { FunctionEngine } from '../../lib/faas'
import { LocalFileStorage } from '../../lib/storage/local_file_storage'
import Config from '../../config'
import request from 'axios'
import { nanosecond2ms } from '../../lib/time'
import { LessInterface } from '../../lib/types'

export const FunctionRouter = Router()
const logger = getLogger('admin:api')


FunctionRouter.post('/invoke/:name', invokeFunction)
FunctionRouter.all('/:name', invokeFunction)         // alias for /invoke/:name

async function invokeFunction(req: Request, res: Response) {
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
  const r = await db.collection('functions')
    .where({ name: func_name })
    .getOne()

  if (!r.ok) {
    logger.info(`[${requestId}] /func/invoke/${func_name} read functions failed: ` + r.error.toString())
    return res.send({ code: 1, error: r.error, requestId })
  }

  if (!r.data) {
    return res.send({ code: 1, error: 'function not found', requestId })
  }

  // 调用前计时
  const _start_time = process.hrtime.bigint()

  // 调用函数
  const func = r.data
  const engine = new FunctionEngine()
  const result = await engine.run(func.code, {
    requestId,
    functionName: func_name,
    query: req.query,
    body: req.body,
    auth: req['auth'],
    less: createLessSdk()
  })

  // 函数执行耗时
  const _end_time = process.hrtime.bigint()
  const time_usage = nanosecond2ms(_end_time - _start_time)

  // 将云函数调用日志存储到数据库
  {
    await db.collection('function_logs')
      .add({
        requestId: requestId,
        func_id: func._id,
        func_name: func_name,
        logs: result.logs,
        time_usage: time_usage,
        created_at: Date.now(),
        updated_at: Date.now(),
        created_by: req['auth']?.uid
      })
  }

  // 调用出错
  if (result.error) {
    logger.info(`[${requestId}] /func/invoke/${func_name} invoke error: `, result.error.message)
    logger.trace(`[${requestId}] /func/invoke/${func_name} invoke error: `, result)
    return res.send({
      code: 1,
      error: 'invoke function occurs error',
      logs: debug ? result.logs : undefined,
      time_usage: debug ? time_usage : undefined,
      requestId
    })
  }

  logger.trace(`[${requestId}] /func/invoke/${func_name} invoke success: `, result)

  // 调用成功返回
  return res.send({
    code: 0,
    requestId,
    data: result.data,
    time_usage: debug ? time_usage : undefined,
    logs: debug ? result.logs : undefined
  })
}

function createLessSdk(): LessInterface {
  const less: LessInterface = {
    database: () => db,
    storage: (namespace: string) => new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace),
    fetch: request,
  }

  return less
}