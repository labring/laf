/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-29 11:35:05
 * @LastEditTime: 2021-08-30 17:15:38
 * @Description:
 */

import { Router } from "express"
import { handlePublishPolicies } from "./policy"


export const PolicyRouter = Router()

/**
 * Get policies of an application
 */
PolicyRouter.get('/')

/**
 * Create a policy
 */
PolicyRouter.post('/create')

/**
 * Update the policy's info except the rules
 */
PolicyRouter.post('/:func_id/info')

/**
 * Update the policy's rules
 */
PolicyRouter.post('/:func_id/rules')

/**
 * Publish the policies of the application
 */
PolicyRouter.post('/publish', handlePublishPolicies)