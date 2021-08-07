import * as express from 'express'
import * as assert from 'assert'
import { deployFunctions, publishFunctions } from '../../api/function'
import { checkPermission } from '../../api/permission'
import { Globals } from '../../lib/globals'
import { getToken, parseToken } from '../../lib/utils/token'
import { deployPolicies, publishAccessPolicy } from '../../api/rules'

export const DeployRouter = express.Router()
const logger = Globals.logger
/**
 * 创建部署令牌
 */
DeployRouter.post('/create-token', async (req, res) => {
  const { permissions, expire, source } = req.body
  if (!permissions || !permissions?.length) {
    return res.send({
      code: 1,
      error: 'invalid permissions'
    })
  }

  if (!expire) {
    return res.send({
      code: 1,
      error: 'invalid expire'
    })
  }

  if (!source) {
    return res.send({
      code: 1,
      error: 'invalid expire'
    })
  }

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'deploy.create_token')
  if (code) {
    return res.status(code).send()
  }

  try {
    const expired_at = Math.floor(Date.now() / 1000 + expire * 3600)
    const payload = { type: "deploy", pns: permissions, exp: expired_at, src: source }
    const token = getToken(payload)

    return res.send({
      code: 0,
      data: {
        source,
        token,
        expired_at,
        permissions
      }
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error.toString()
    })
  }

})

/**
 * 接收部署请求
 */
DeployRouter.post('/in', async (req, res) => {
  const { policies, functions, comment } = req.body
  if (!policies && !functions) {
    return res.status(422).send('invalid polices & functions')
  }

  // 令牌验证
  const token = req.body?.deploy_token
  const auth = parseToken(token)
  console.log(token, auth)

  if (!auth) {
    return res.status(401).send('Unauthorized')
  }

  if (auth.type !== 'deploy') {
    return res.status(403).send('Permission Denied')
  }

  // 令牌权限
  const permissions = auth.pns ?? []
  const can_deploy_function = permissions.includes('function')
  const can_deploy_policy = permissions.includes('policy')

  // 来源标识
  const source = auth.src
  const db = Globals.sys_db

  try {
    // 入库访问策略
    if (policies && can_deploy_policy) {
      const data = {
        source,
        status: 'pending',  // 'pending' | 'applied' | 'canceled' 
        type: 'policy',
        data: policies,
        comment,
        created_at: Date.now()
      }

      await db.collection('deploy_requests').add(data)
    }

    // 入库云函数
    if (functions && can_deploy_function) {
      const data = {
        source,
        status: 'pending',  // 'pending' | 'deployed' | 'canceled' 
        type: 'function',
        data: functions,
        comment,
        created_at: Date.now()
      }

      await db.collection('deploy_requests').add(data)
    }

    return res.send({
      code: 0,
      data: 'accepted'
    })
  } catch (error) {
    logger.error(error)
    return res.status(500).send('Internal Server Error: ' + error.toString())
  }
})

/**
 * 应用部署请求
 */
DeployRouter.post('/apply', async (req, res) => {

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'deploy_request.apply')
  if (code) {
    return res.status(code).send()
  }

  const id = req.body?.id
  if (!id) {
    return res.status(422).send('invalid id')
  }

  const db = Globals.sys_db
  const r = await db.collection('deploy_requests').where({ _id: id }).getOne()
  if (!r.ok || !r.data) {
    return res.status(404).send('deploy request not found')
  }

  const deploy_request = r.data
  const type = deploy_request.type
  assert.ok(['function', 'policy'].includes(type))

  if (type === 'function') {
    await deployFunctions(deploy_request.data)
    await publishFunctions()
  }

  if (type === 'policy') {
    await deployPolicies(deploy_request.data)
    await publishAccessPolicy()
  }

  // update deploy request status to 'deployed'
  await db.collection('deploy_requests').where({ _id: id }).update({ status: 'deployed' })

  return res.send({
    code: 0,
    data: 'deployed'
  })
})