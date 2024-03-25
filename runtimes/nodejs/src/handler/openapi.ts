import { Response } from 'express'
import { parseToken } from '../support/token'
import { IRequest } from '../support/types'
import { buildOpenAPIDefinition } from '../support/openapi'
import Config from '../config'

export async function handleOpenAPIDefinition(req: IRequest, res: Response) {
  // verify the openapi token
  const token = req.query['token'] as string
  if (!token) {
    return res.status(400).send('x-laf-openapi-token is required')
  }
  const auth = parseToken(token) || null
  if (auth?.type !== 'openapi') {
    return res.status(403).send('permission denied: invalid openapi token')
  }

  const doc = buildOpenAPIDefinition({
    title: `Laf Application ${Config.APPID} Cloud Function API`,
    version: '1.0.0',
    host: req.get('host'),
    apiVersion: '3.0.0',
  })
  res.json(doc)
}
