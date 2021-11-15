import { Request, Response, Router } from 'express'
import { BucketRouter } from './bucket'
import { FileRouter } from './file'
import { parseToken } from '../lib/utils'

export const router = Router()

router.use(FileRouter)
router.use('/sys', checkAuth, BucketRouter)


/**
 * Middleware: check auth token to managing buckets
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
async function checkAuth(req: Request, res: Response, next: any) {
  const token = req.query?.token as string
  const payload = parseToken(token)
  if (!payload) {
    return res.status(401).send('Unauthorized')
  }

  if (payload.src !== 'sys') {
    return res.status(403).send('Permission denied')
  }

  next(null, req, res)
}