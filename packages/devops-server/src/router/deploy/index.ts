import * as express from 'express'
import { checkPermission } from '../../api/permission'
import { deployAccessPolicy } from '../../api/rules'

export const DeployRouter = express.Router()

/**
 * 
 */
DeployRouter.post('/policy', async (req, res) => {

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'deploy.policy')
  if (code) {
    return res.status(code).send()
  }

  try {
    const r = await deployAccessPolicy()

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