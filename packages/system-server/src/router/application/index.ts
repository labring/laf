/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-29 11:35:11
 * @LastEditTime: 2021-08-31 15:56:38
 * @Description: 
 */

import { Router } from 'express'
import { handleNotImplemented } from '../common'
import { handleCreateApplication } from './create'
import { handleMyApplications } from './my'

export const ApplicationRouter = Router()

/**
 * Get my applications 
 */
ApplicationRouter.get('/my', handleMyApplications)

/**
 * Create an application
 */
ApplicationRouter.post('/create', handleCreateApplication)

/**
 * Update an application by appid
 */
ApplicationRouter.post('/:appid', handleNotImplemented)

/**
 * Remove an application by appid 
 */
ApplicationRouter.delete('/:appid', handleNotImplemented)

/**
 * Invite an collaborator into application
 */
ApplicationRouter.post('/:appid/invite', handleNotImplemented)