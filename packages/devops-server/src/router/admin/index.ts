import { Router } from 'express'

import { handleAdminAdd, handleAdminEdit, handleAdminInfo, handleAdminLogin } from './handlers'

export const AdminRouter = Router()

/**
 * 管理员登陆
 */
AdminRouter.post('/login', handleAdminLogin)


/**
 * 管理员信息
 */
AdminRouter.get('/info', handleAdminInfo)

/**
 * 新增管理员
 */
AdminRouter.post('/add', handleAdminAdd)

/**
 * 编辑管理员
 */
AdminRouter.post('/edit', handleAdminEdit)
