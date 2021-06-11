import { Router } from 'express'
import { Entry, Ruler } from 'less-api'
import { accessor } from '../../lib/db'
import { getLogger } from '../../lib/logger'
import { getAccessRules } from '../../lib/api/rules'

const logger = getLogger('app:entry')
export const AppEntryRouter = Router()

const ruler = new Ruler(accessor)
accessor.ready.then(async () => {
  const rules = await getAccessRules('app')
  ruler.load(rules)
})

export const entry = new Entry(accessor, ruler)

AppEntryRouter.post('/entry', async (req, res) => {
  const requestId = req['requestId']

  const auth = req['auth'] ?? {}

  // parse params
  const params = entry.parseParams({ ...req.body, requestId })

  const injections = {
    $uid: auth.uid
  }
  // validate query
  const result = await entry.validate(params, injections)
  if (result.errors) {
    logger.debug(`[${requestId}] validate return errors: `, result.errors)
    return res.send({
      code: 1,
      error: result.errors,
      injections
    })
  }

  // execute query
  try {
    const data = await entry.execute(params)
    logger.trace(`[${requestId}] executed query: `, data)

    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    return res.send({
      code: 2,
      error: error,
      injections
    })
  }
})