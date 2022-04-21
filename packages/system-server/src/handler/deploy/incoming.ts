/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:34:45
 * @LastEditTime: 2021-10-08 01:30:42
 * @Description: 
 */

import { Request, Response } from 'express'
import { Constants } from '../../constants'
import { ApplicationStruct } from '../../support/application'
import { DatabaseAgent } from '../../db'
import { logger } from '../../logger'
import { parseToken } from '../../support/token'


/**
 * Accept the deployment requests from remote environment
 */
export async function handleDeployRequestIncoming(req: Request, res: Response) {
  const app: ApplicationStruct = req['parsed-app']
  const appid = app.appid

  const { policies, functions, comment } = req.body
  if (!policies && !functions) return res.status(422).send('not found functions and policies')

  // verify deploy token
  const token = req.body?.deploy_token
  const auth = parseToken(token, app.config.server_secret_salt)

  if (!auth)
    return res.status(401).send('Unauthorized')

  if (auth.type !== 'deploy')
    return res.status(403).send('Permission Denied')

  if (appid !== auth.appid)
    return res.status(403).send('forbidden operation: token is not matching the appid')

  // verify deploy token permissions
  const permissions = auth.pns ?? []
  const can_deploy_function = permissions.includes('function')
  const can_deploy_policy = permissions.includes('policy')

  // the source that identified remote environment
  const source = auth.src

  // reject if token hasn't been granted
  if (policies && !can_deploy_policy) {
    return res.status(403).send('policies deploy is not granted to given token ')
  }

  if (functions && !can_deploy_function) {
    return res.status(403).send('functions deploy is not granted to given token ')
  }

  try {
    // write remote policies to db
    if (policies && can_deploy_policy) {
      await write_policies(policies, source, comment, appid)
    }

    // write remote functions to db
    if (functions && can_deploy_function) {
      await write_functions(functions, source, comment, appid)
    }

    return res.send({
      code: 0,
      data: 'accepted'
    })
  } catch (error) {
    logger.error(error)
    return res.status(500).send('Internal Server Error: ' + error.toString())
  }
}


/**
 * save the policies from remote deployment request
 * @param policies 
 * @param source 
 * @param comment 
 * @param appid 
 */
async function write_policies(policies: any, source: string, comment: string, appid: string) {
  const db = DatabaseAgent.db

  const data = {
    source,
    status: 'pending',  // 'pending' | 'applied' | 'canceled' 
    type: 'policy',
    data: policies,
    comment,
    appid,
    created_at: Date.now()
  }

  await db.collection(Constants.colls.deploy_requests).insertOne(data)
}

/**
 * save the functions and triggers from remote deployment request
 * @param functions 
 * @param triggers 
 * @param source 
 * @param comment 
 * @param appid 
 */
async function write_functions(functions: any, source: string, comment: string, appid: string) {
  const db = DatabaseAgent.db

  const data = {
    source,
    status: 'pending',  // 'pending' | 'deployed' | 'canceled' 
    type: 'function',
    data: functions,
    comment,
    appid,
    created_at: Date.now()
  }

  await db.collection(Constants.colls.deploy_requests).insertOne(data)
}