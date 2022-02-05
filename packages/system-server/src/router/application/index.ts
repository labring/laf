/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-29 11:35:11
 * @LastEditTime: 2022-01-19 14:47:05
 * @Description:
 */

import { Router } from 'express'
import * as multer from 'multer'
import path = require('path')
import { generateUUID } from '../../utils/rand'
import { handleNotImplemented } from '../common'
import { handleGetCollaborators, handleGetRoles, handleInviteCollaborator, handleRemoveCollaborator, handleSearchCollaborator } from './collaborator'
import { handleCreateApplication } from './create'
import { handleExportApplication } from './exporter'
import { handleGetApplicationByAppid, handleMyApplications } from './get'
import { handleImportApplication, handleInitApplicationWithTemplate } from './importer'
import { handleAddPackage, handleGetPackages, handleRemovePackage, handleUpdatePackage } from './packages'
import { handleRemoveApplication } from './remove'
import { handleStopApplicationService, handleStartApplicationService } from './service'
import { handleUpdateApplication } from './update'

/**
 * Creates the multer uploader
 */
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, generateUUID() + ext)
    }
  })
})

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
 * Remove an application by appid
 */
ApplicationRouter.delete('/:appid', handleRemoveApplication)

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


/**
 * Export the definition of application
 */
ApplicationRouter.get('/:appid/export', handleExportApplication)

/**
 * Import the definition to application
 */
ApplicationRouter.post('/:appid/import', uploader.single('file'), handleImportApplication)

/**
 * Init appliaction with template
 */
ApplicationRouter.post('/:appid/init-with-template', handleInitApplicationWithTemplate)

/**
 * Get packages from app
 */
ApplicationRouter.get('/:appid/packages', handleGetPackages)

/**
 * Add package to app
 */
ApplicationRouter.post('/:appid/packages', handleAddPackage)

/**
 * Update a package in app
 */
ApplicationRouter.put('/:appid/packages', handleUpdatePackage)

/**
 * Remove a package from app
 */
ApplicationRouter.delete('/:appid/packages', handleRemovePackage)
