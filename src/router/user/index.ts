import { Router } from 'express'
import { LoginRouter } from './login'
import { RegisterRouter } from './register'

export const UserRouter = Router()

UserRouter.use(LoginRouter)
UserRouter.use(RegisterRouter)