import { Request, Response } from 'express'
import { db } from '../../lib/db'
import { checkPermission } from '../../lib/api/permission'
import { getLogger } from '../../lib/logger'
import { scheduler, Trigger } from '../../lib/faas'

const logger = getLogger('admin:api')

/**
 * 应用触发器配置
 * @query tid? 触发器ID，若缺省则重新应用所有触发器配置
 */
export async function handleApplyTrigger(req: Request, res: Response) {
  const requestId = req['requestId']
  logger.info(`[${requestId}] /apply/triggers`)

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'trigger.apply')
  if (code) {
    return res.status(code).send()
  }

  const triggerId = req.query.tid ?? null

  try {
    logger.debug(`[${requestId}] apply trigger rule`)

    // 若未提供 triggerId， 则更新所有触发器调度
    if (!triggerId) {
      await scheduler.init()
      return res.send({ code: 0, data: 'ok:applied' })
    }

    // get trigger by id
    const r = await db.collection('triggers').where({ _id: triggerId }).getOne()
    if (!r.ok) return res.status(404).send('trigger not found')

    // 更新指定触发器
    const trigger = Trigger.fromJson(r.data)
    const result = await scheduler.updateTrigger(trigger)

    return res.send({
      code: 0,
      data: result ? 'ok:applied' : 'ok:unchanged'
    })
  } catch (error) {
    logger.error(`[${requestId}] apply trigger rule error: `, error)
    return res.send({
      code: 1,
      data: error
    })
  }
}