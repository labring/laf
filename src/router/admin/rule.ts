import { Request, Response } from 'express'
import { checkPermission } from '../../lib/api/permission'
import { getLogger } from '../../lib/logger'
import { applyRules } from '../../lib/api/rules'

const logger = getLogger('admin:api')

/**
 * 应用最新访问规则
 */
export async function handleApplyRules(req: Request, res: Response)  {
  const requestId = req['requestId']
  logger.info(`[${requestId}] /apply/rules`)

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'rule.apply')
  if (code) {
    return res.status(code).send()
  }

  // apply rules
  try {
    logger.debug(`[${requestId}] apply rules`)
    await applyRules()
  } catch (error) {
    logger.error(`[${requestId}] apply rule error: `, error)
  }

  return res.send({
    code: 0,
    data: 'applied'
  })

}