import * as express from 'express'
import { publishFunctions } from '../../api/function'
import { checkPermission } from '../../api/permission'
import { publishAccessPolicy } from '../../api/rules'
import { publishTriggers } from '../../api/trigger'

export const PublishRouter = express.Router()

/**
 * 发布访问策略
 */
PublishRouter.post('/policy', async (req, res) => {

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'publish.policy')
  if (code) {
    return res.status(code).send()
  }

  try {
    const r = await publishAccessPolicy()

    return res.send({
      code: 0,
      data: r
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error
    })
  }
})

/**
 * 发布云函数
 */
 PublishRouter.post('/functions', async (req, res) => {

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'publish.function')
  if (code) {
    return res.status(code).send()
  }

  try {
    const r = await publishFunctions()

    return res.send({
      code: 0,
      data: r
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error
    })
  }
})


/**
 * 发布触发器
 */
 PublishRouter.post('/triggers', async (req, res) => {

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'publish.trigger')
  if (code) {
    return res.status(code).send()
  }

  try {
    const r = await publishTriggers()

    return res.send({
      code: 0,
      data: r
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error
    })
  }
})