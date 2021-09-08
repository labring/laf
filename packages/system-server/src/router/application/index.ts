/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-29 11:35:11
 * @LastEditTime: 2021-09-09 00:43:39
 * @Description: 
 */

import { Router } from 'express'
import { handleNotImplemented } from '../common'
import { handleGetCollaborators, handleGetRoles, handleInviteCollaborator, handleRemoveCollaborator, handleSearchCollaborator } from './collaborator'
import { handleCreateApplication } from './create'
import { handleGetApplicationByAppid, handleMyApplications } from './get'
import { handleStopApplicationService, handleStartApplicationService, handleRemoveApplicationService } from './service'
import { handleUpdateApplication } from './update'

export const ApplicationRouter = Router()

/**
 * Get my applications 
 */
ApplicationRouter.get('/my', handleMyApplications)

/**
 * Get application by id
 */
ApplicationRouter.get('/:appid', handleGetApplicationByAppid)

/**
 * Create an application
 */
ApplicationRouter.post('/create', handleCreateApplication)

/**
 * Update an application by appid
 */
ApplicationRouter.post('/:appid', handleUpdateApplication)

/**
 * Start an application service by appid
 */
ApplicationRouter.post('/:appid/service/start', handleStartApplicationService)

/**
 * Stop an application service by appid
 */
ApplicationRouter.post('/:appid/service/stop', handleStopApplicationService)

/**
 * Remove an application service by appid
 */
ApplicationRouter.post('/:appid/service/remove', handleRemoveApplicationService)

/**
 * Remove an application by appid 
 */
ApplicationRouter.delete('/:appid', handleNotImplemented)

/**
 * Get collaborators of application
 */
ApplicationRouter.get('/:appid/collaborators', handleGetCollaborators)

/**
 * Search collaborator of application
 */
ApplicationRouter.post('/collaborators/search', handleSearchCollaborator)

/**
 * Get all application roles
 */
ApplicationRouter.get('/collaborators/roles', handleGetRoles)

/**
 * Update a collaborator of application
 */
ApplicationRouter.put('/:appid/collaborators', handleNotImplemented)

/**
 * Invite an collaborator into application
 */
ApplicationRouter.post('/:appid/invite', handleInviteCollaborator)

/**
 * Remove a collaborator of application
 */
ApplicationRouter.delete('/:appid/collaborators/:collaborator_id', handleRemoveCollaborator)
