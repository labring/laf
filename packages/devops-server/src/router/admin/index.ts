/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 17:04:22
 * @Description: 
 */

import { Router } from 'express'
import { handleAdminAdd, handleAdminEdit, handleAdminInfo, handleAdminLogin } from './handlers'

export const AdminRouter = Router()

/**
 * admin login
 */
AdminRouter.post('/login', handleAdminLogin)


/**
 * get admin info
 */
AdminRouter.get('/info', handleAdminInfo)

/**
 * add admin
 */
AdminRouter.post('/add', handleAdminAdd)

/**
 * edit admin
 */
AdminRouter.post('/edit', handleAdminEdit)
