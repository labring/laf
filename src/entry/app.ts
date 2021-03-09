import { Router } from 'express'
import { Entry, MysqlAccessor } from 'less-api'
import Config from '../config'
const rules = require('../rules/app.json')

const router = Router()

router.all('*', function (_req, _res, next) {
  next()
})
const accessor = new MysqlAccessor(Config.db)
const entry = new Entry(accessor)
entry.init()
entry.loadRules(rules)

router.post('/entry', async (req, res) => {
  // parse params
  const params = entry.parseParams(req.body)

  const injections = {
  }
  // validate query
  const result = await entry.validate(params, injections)
  if (result.errors) {
    return res.send({
      code: 1,
      error: result.errors,
      injections
    })
  }

  // execute query
  try {
    const data = await entry.execute(params)
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

export default router