/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-07 01:14:33
 * @LastEditTime: 2021-09-06 16:28:25
 * @Description: 
 */

import * as express from 'express'
import { handleCreateDeployToken } from './create-token'
import { handleDeployRequestIncoming } from './incoming'
import { handleApplyDeployRequest, handleGetDeployRequests, handleRemoveDeployRequest } from './request'
import { handleCreateDeployTarget, handleGetDeployTargets, handleRemoveDeployTarget, handleUpdateDeployTarget } from './target'

export const DeployRouter = express.Router()


/**
 * Create a deploy target
 */
DeployRouter.post('/targets/create', handleCreateDeployTarget)

/**
 * Get deploy targets
 */
DeployRouter.get('/targets', handleGetDeployTargets)

/**
* Update a deploy target
*/
DeployRouter.post('/targets/:target_id', handleUpdateDeployTarget)

/**
* Remove a deploy target
*/
DeployRouter.delete('/targets/:target_id', handleRemoveDeployTarget)

/**
 * Create a deployment token
 */
DeployRouter.post('/create-token', handleCreateDeployToken)

/**
 * Accept the deployment requests from remote environment
 */
DeployRouter.post('/incoming', handleDeployRequestIncoming)

/**
 * Get deployment requests which accept from remote environment
 */
DeployRouter.get('/requests', handleGetDeployRequests)

/**
 * Remove a deployment requests which accept from remote environment
 */
DeployRouter.delete('/requests/:req_id', handleRemoveDeployRequest)

/**
 * Apply the deployment requests which accept from remote environment
 */
DeployRouter.post('/requests/:req_id/apply', handleApplyDeployRequest)