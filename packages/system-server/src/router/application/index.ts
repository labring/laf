/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-29 11:35:11
 * @LastEditTime: 2021-08-30 17:05:02
 * @Description: 
 */

import { Router } from 'express'

export const ApplicationRouter = Router()

/**
 * Get my applications 
 */
ApplicationRouter.get('/my')

/**
 * Create an application
 */
ApplicationRouter.post('/')

/**
 * Update an application by appid
 */
ApplicationRouter.post('/:appid')

/**
 * Remove an application by appid 
 */
ApplicationRouter.delete('/:appid')

/**
 * Invite an collaborator into application
 */
ApplicationRouter.post('/:appid/invite')