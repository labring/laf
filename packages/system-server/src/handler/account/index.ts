/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-08 03:33:19
 * @Description: 
 */

import { Router } from 'express'
import { handleEdit } from './edit'
import { handleProfile } from './get'
import { handleSignIn } from './signin'
import { handleSignUp } from './signup'
import { handleResetPassword } from './resetPassword'

export const AccountRouter = Router()

/**
 * account login
 */
AccountRouter.post('/login', handleSignIn)

/**
 * get account profile
 */
AccountRouter.get('/profile', handleProfile)

/**
 * account 
 */
AccountRouter.post('/signup', handleSignUp)

/**
 * edit admin
 */
AccountRouter.post('/edit', handleEdit)


/**
 * reset account password
 */
AccountRouter.post('/resetPassword', handleResetPassword)
