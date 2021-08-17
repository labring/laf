/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 14:06:03
 * @Description: 
 */
import { Router } from 'express'
import { Proxy } from 'less-api'
import Config from '../../config'
import { createLogger } from '../../lib/logger'
import { DatabaseAgent } from '../../lib/database'
import { PolicyAgentInstance } from '../../lib/policy-agent'

const logger = createLogger('proxy')
const accessor = DatabaseAgent.accessor
export const EntryRouter = Router()

EntryRouter.post('/proxy/:policy', async (req, res) => {
  const requestId = req['requestId']
  const auth = req['auth'] ?? {}
  const policy_name = req.params?.policy

  const policyComposition = PolicyAgentInstance.get(policy_name)
  if (!policyComposition) {
    return res.status(404).send('Policy Not Found')
  }

  const proxy = new Proxy(accessor, policyComposition.policy)

  // parse params
  const params = proxy.parseParams({ ...req.body, requestId })

  // get injections
  const injections = await policyComposition.injector_func(auth, params)

  // validate query
  const result = await proxy.validate(params, injections)
  if (result.errors) {
    logger.debug(`[${requestId}] validate return errors: `, result.errors)
    return res.status(403).send({
      code: 'permission denied',
      error: result.errors,
      injections: Config.isProd ? undefined : injections
    })
  }

  // execute query
  try {
    const data = await proxy.execute(params)
    logger.trace(`[${requestId}] executed query: `, data)

    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    logger.error(requestId, 'execute query got error:  ', error)
    return res.send({
      code: 2,
      error: error.toString(),
      injections: Config.isProd ? undefined : injections
    })
  }
})