import { Request, Response, Router } from 'express'
import { BucketRouter } from './bucket'
import { FileRouter } from './file'
import { parseToken } from '../lib/utils'
import { DatabaseAgent } from '../lib/database'

export const router = Router()

router.get('/health-check', (_req, res) => {
  if (!DatabaseAgent.db) {
    return res.status(400).send('no db connection')
  }
  return res.status(200).send('ok')
})

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