/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-07 01:14:33
 * @LastEditTime: 2021-08-30 16:40:14
 * @Description: 
 */

import * as express from 'express'
import { handleCreateDeployToken } from './create-token'
import { handleApplyDeployRequest } from './apply'
import { handleDeployRequestIncoming } from './incoming'

export const DeployRouter = express.Router()

/**
 * Create a deployment token
 */
DeployRouter.post('/create-token', handleCreateDeployToken)

/**
 * Accept the deployment requests from remote environment
 */
DeployRouter.post('/in', handleDeployRequestIncoming)

/**
 * Apply the deployment requests which accept from remote environment
 */
DeployRouter.post('/apply', handleApplyDeployRequest)