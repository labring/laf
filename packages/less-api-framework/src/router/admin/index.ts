import { Router } from 'express'

import { handleApplyRules } from './rule'
import { handleApplyTrigger } from './trigger'
import { handleAdminAdd, handleAdminEdit, handleAdminInfo, handleAdminLogin } from './admin'

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


/**
 * 应用最新访问规则
 */
AdminRouter.post('/apply/rules', handleApplyRules)


/**
 * 应用触发器配置
 */
AdminRouter.post('/apply/triggers', handleApplyTrigger)