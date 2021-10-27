import { Router } from 'express'
import { BucketRouter } from './bucket'
import {FileRouter} from './file'

export const router = Router()

router.use(FileRouter)
router.use(BucketRouter)