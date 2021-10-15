import { Router } from 'express'
import {FileRouter} from './file'

export const router = Router()

router.use('/file', FileRouter)