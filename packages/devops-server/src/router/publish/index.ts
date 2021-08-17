/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 17:18:33
 * @Description: 
 */

import * as express from 'express'
import { publishFunctions } from '../../api/function'
import { checkPermission } from '../../api/permission'
import { publishAccessPolicy } from '../../api/policy'
import { publishTriggers } from '../../api/trigger'

export const PublishRouter = express.Router()

/**
 * Publish policies
 */
PublishRouter.post('/policy', async (req, res) => {

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'publish.policy')
  if (code) {
    return res.status(code).send()
  }

  try {
    await publishAccessPolicy()

    return res.send({
      code: 0,
      data: 'ok'
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error
    })
  }
})

/**
 * Publish functions
 */
PublishRouter.post('/functions', async (req, res) => {

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'publish.function')
  if (code) {
    return res.status(code).send()
  }

  try {
    await publishFunctions()

    return res.send({
      code: 0,
      data: 'ok'
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error
    })
  }
})


/**
 * Publish triggers
 */
PublishRouter.post('/triggers', async (req, res) => {

  // check permission
  const code = await checkPermission(req['auth']?.uid, 'publish.trigger')
  if (code) {
    return res.status(code).send()
  }

  try {
    await publishTriggers()

    return res.send({
      code: 0,
      data: 'ok'
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error
    })
  }
})