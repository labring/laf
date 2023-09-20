import express from 'express'
import Config from './config'
import { logger } from './support/logger'
import { DatabaseAgent } from './db'
import xmlparser from 'express-xml-bodyparser'
import './support/cloud-sdk'
import { WebsiteHostingChangeStream } from './support/database-change-stream/website-hosting-change-stream'
import proxy from 'express-http-proxy'
import axios from 'axios'

const app = express()

DatabaseAgent.accessor.ready.then(() => {
  WebsiteHostingChangeStream.initialize()
})

app.use(
  express.urlencoded({
    limit: Config.REQUEST_LIMIT_SIZE,
    extended: true,
  }) as any,
)

app.use(xmlparser())

const tryPath = (path: string) => {
  return [path, path + '/index.html', path + 'index.html', '/index.html']
}

app.use(
  '/:bucket',
  proxy(Config.OSS_INTERNAL_ENDPOINT, {
    filter: function (req) {
      return req.method == 'GET'
    },
    proxyReqPathResolver: async function (req) {
      const minioUrl = new URL(req.baseUrl, Config.OSS_EXTERNAL_ENDPOINT)

      const websiteHosting = WebsiteHostingChangeStream.websiteHosting.find(
        (item) => item.bucket === req.params.bucket,
      )
      if (!websiteHosting) {
        return minioUrl.toString()
      }

      const paths = tryPath(req.baseUrl)
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

          if (res.headers['Content-Type'] === 'folder') {
            continue
          }
          return minioUrl.toString()
        } catch (err) {
          if (
            err.response.status === 404 ||
            err.response.status === 403 ||
            err.response.status === 400
          ) {
            continue
          }
          return minioUrl.toString()
        }
      }
    },
  }),
)

const storageServer = app.listen(Config.STORAGE_PORT, () =>
  logger.info(`storage server ${process.pid} listened on ${Config.PORT}`),
)

export default storageServer
