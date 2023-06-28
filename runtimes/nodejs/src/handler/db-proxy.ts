import { Response } from 'express'
import { Proxy } from 'database-proxy'
import Config from '../config'
import { DatabaseAgent } from '../db'
import { logger } from '../support/logger'
import { PolicyAgent } from '../support/policy'
import { IRequest } from '../support/types'

export async function handleDatabaseProxy(req: IRequest, res: Response) {
  const accessor = DatabaseAgent.accessor

  const requestId = req['requestId']
  const auth = req.user || {}
  const policy_name = req.params?.policy

  // get corresponding policy
  const policy_comp = await PolicyAgent.get(policy_name)
  if (!policy_comp) {
    return res.status(404).send('Policy Not Found')
  }

  // create a database proxy
  const proxy = new Proxy(accessor, policy_comp.policy)

  // parse params
  const params = proxy.parseParams(req.body)

  // get injections by invoking the injector function of policy
  const injections = await policy_comp.injector_func(auth, params)

  // validate query
  const result = await proxy.validate(params, injections)
  if (result.errors) {
    logger.error(requestId, `validate return errors: `, result.errors)
    return res.status(403).send({
      code: 'permission denied',
      error: result.errors,
      injections: Config.isProd ? undefined : injections,
    })
  }

  // execute query
  try {
    const data = await proxy.execute(params)
    logger.debug(requestId, 'executed query success with params: ', params)
    logger.trace(requestId, `executed query: `, data)

    return res.send({
      code: 0,
      data,
    })
  } catch (error) {
    logger.error(requestId, 'execute query got error:  ', error)
    return res.send({
      code: 1,
      error: error.toString(),
      injections: Config.isProd ? undefined : injections,
    })
  }
}
