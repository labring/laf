import { Router } from 'express'
import { db } from '../../lib/db'
import { checkPermission } from '../../lib/api/permission'
import { getLogger } from '../../lib/logger'
import { FunctionEngine } from '../../lib/faas'
import { LocalFileStorage } from '../../lib/storage/local_file_storage'
import Config from '../../config'
import request from 'axios'

export const FunctionRouter = Router()
const logger = getLogger('admin:api')


/**
 * 获取云函数
 */
FunctionRouter.get('/func/:name', async (req, res) => {
  const requestId = req['requestId']
  const func_name = req.params?.name

  if (!func_name) {
    return res.send({ code: 1, error: 'invalid function name' })
  }

  logger.info(`[${requestId}] /func/${func_name}: ${req.body?.uid}`)

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'function.read')
  if (code) {
    return res.status(code).send()
  }

  // 获取函数
  const r = await db.collection('functions')
    .where({ name: func_name })
    .getOne()

  if (!r.ok) {
    logger.info(`[${requestId}] /func/${func_name} read functions failed: ` + r.error.toString())
    return res.send({ code: 1, error: r.error })
  }

  return res.send({
    code: 0,
    data: r.data
  })
})


FunctionRouter.post('/func/invoke/:name', async (req, res) => {
  const requestId = req['requestId']
  const func_name = req.params?.name

  if (!func_name) {
    return res.send({ code: 1, error: 'invalid function name', requestId })
  }

  const { params } = req.body

  logger.info(`[${requestId}] /func/${func_name} params: `, params)

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

  // 调用函数
  const func = r.data
  const engine = new FunctionEngine()

  const result = await engine.run(func.code, {
    requestId,
    functionName: func_name,
    params: params,
    auth: req['auth'],
    less: {
      database: () => db,
      storage: (namespace: string) => new LocalFileStorage(Config.LOCAL_STORAGE_ROOT_PATH, namespace),
      fetch: request
    }
  })

  if (result.error) {
    logger.info(`[${requestId}] /func/invoke/${func_name} invoke error: `, result.error.message)
    logger.trace(`[${requestId}] /func/invoke/${func_name} invoke error: `, result)
    return res.send({
      code: 1,
      error: 'invoke function occurs error',
      logs: Config.isProd ? undefined : result.logs,
      requestId
    })
  }

  logger.trace(`[${requestId}] /func/invoke/${func_name} invoke result: `, result)

  return res.send({
    code: 0,
    requestId,
    data: result.data,
    logs: Config.isProd ? undefined : result.logs
  })
})