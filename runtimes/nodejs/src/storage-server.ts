import express from 'express'

import { parseToken, splitBearerToken } from './support/token'
import Config from './config'
import { logger } from './support/logger'
import { generateUUID } from './support/utils'
import { DatabaseAgent } from './db'
import xmlparser from 'express-xml-bodyparser'

// init static method of class
import './support/cloud-sdk'
import { WebsiteHostingStreamChange } from './support/database-change-stream/website-hosting-stream-change'
import proxy from 'express-http-proxy'
import axios from 'axios'

const app = express()

DatabaseAgent.accessor.ready.then(() => {
  WebsiteHostingStreamChange.initialize()
})

app.use(
  express.urlencoded({
    limit: Config.REQUEST_LIMIT_SIZE,
    extended: true,
  }) as any,
)

app.use(xmlparser())


/**
 * Parsing bearer token
 */
app.use(function (req, res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['user'] = auth

  const requestId = (req['requestId'] =
    req.headers['x-request-id'] || generateUUID())
  if (req.url !== '/_/healthz') {
    logger.info(
      requestId,
      `${req.method} "${req.url}" - referer: ${req.get('referer') || '-'
      } ${req.get('user-agent')}`,
    )
    logger.trace(requestId, `${req.method} ${req.url}`, {
      body: req.body,
      headers: req.headers,
      auth,
    })
  }
  res.set('request-id', requestId)
  next()
})

const tryPath = (path: string) => { 
  return [
    path,
    path + '/index.html',
    path + 'index.html',
    '/index.html',
  ]
}

app.use('/:bucket/:file', proxy(Config.MINIO_INTERNAL_ENDPOINT, {
  filter: function(req) {
     return req.method == 'GET';
  },
  proxyReqPathResolver: async function (req) {
    const minioUrl = new URL(req.url, Config.MINIO_INTERNAL_ENDPOINT)

    const websiteHosting = WebsiteHostingStreamChange.websiteHosting.find((item) => item.bucket === req.params.bucket)
    if (!websiteHosting) { 
      return minioUrl.toString()
    }
    const paths = tryPath(req.path)
    if (paths.length === 0) {
      return minioUrl.toString()
    }


    for (const [idx, path] of paths.entries()) { 
      minioUrl.pathname = path

      if (idx === paths.length - 1) { 
        return minioUrl.toString()
      }

      try {
        const res = await axios.head(minioUrl.toString())
        
        if (res.status === 404 || res.status=== 403 || res.status === 400 || res.headers['Content-Type'] === "folder") { 
          continue
        }
        return minioUrl.toString()
      } catch (err) {
        return err
      }
    }
  }
}));


const storageServer = app.listen(Config.STORAGE_PORT, () =>
  logger.info(`storage server ${process.pid} listened on ${Config.PORT}`),
)

export default storageServer