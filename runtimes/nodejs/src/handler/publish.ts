import { Response } from 'express'
import { logger } from '../support/logger'
import { PolicyAgent } from '../support/policy'
import { IRequest } from '../support/types'

export async function handlePublishPolicies(req: IRequest, res: Response) {
  const auth = req.user
  if (auth?.type !== 'publish') {
    return res.status(403).send('Forbidden')
  }

  await PolicyAgent.applyPolicies()
  logger.info('policy rules applied')

  return res.status(200).send('ok')
}
