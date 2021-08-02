import { Request, Response } from 'express'
import { checkPermission } from '../../api/permission'
import { createLogger } from '../../lib/logger'
import { Trigger } from 'cloud-function-engine'
import { getTriggerById, getTriggers } from '../../api/trigger'
import { SchedulerInstance } from '../../lib/scheduler'

const logger = createLogger('admin:api')

/**
 * @TODO to be removed
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
      const data = await getTriggers()
      const triggers = data.map(data => Trigger.fromJson(data))
      SchedulerInstance.init(triggers)

      return res.send({ code: 0, data: 'ok:applied' })
    }

    // get trigger by id
    const data = await getTriggerById(triggerId as string)
    if (!data) {
      return res.status(404).send('trigger not found')
    }
    // 更新指定触发器
    const trigger = Trigger.fromJson(data)
    const result =  SchedulerInstance.updateTrigger(trigger)

    return res.send({
      code: 0,
      data: result ? 'ok:applied' : 'ok:unchanged'
    })
  } catch (error) {
    logger.error(`[${requestId}] apply trigger error: `, error)
    return res.send({
      code: 1,
      data: error
    })
  }
}