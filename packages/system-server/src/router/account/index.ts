/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-29 11:33:26
 * @Description: 
 */

import { Router } from 'express'
import { handleEdit } from './edit'
import { handleProfile } from './profile'
import { handleSignIn } from './signin'
import { handleSignUp } from './signup'

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
