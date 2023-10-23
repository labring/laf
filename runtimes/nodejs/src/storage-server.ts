import express from 'express'
import Config from './config'
import { logger } from './support/logger'
import './support/cloud-sdk'
import { WebsiteHostingChangeStream } from './support/database-change-stream/website-hosting-change-stream'
import proxy from 'express-http-proxy'
import axios from 'axios'
import cors from 'cors'

const app = express()

app.use(cors())

const tryPath = (bucket: string, path: string) => {
  const testPaths = path.endsWith('/')
    ? [path + 'index.html', '/index.html']
    : [path, path + '/index.html', '/index.html']
  return testPaths.map((v) => `/${bucket}${v}`)
}

app.use(
  proxy(Config.OSS_INTERNAL_ENDPOINT, {
    preserveHostHdr: true,
    parseReqBody: false,
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      // patch for
      if ('content-length' in srcReq.headers) {
        proxyReqOpts.headers['content-length'] =
          srcReq.headers['content-length']
      }
      if ('connection' in srcReq.headers) {
        proxyReqOpts.headers['connection'] = srcReq.headers['connection']
      }
      return proxyReqOpts
    },
    proxyReqPathResolver: async function (req) {
      // check if is website hosting
      const websiteHosting = WebsiteHostingChangeStream.websiteHosting.find(
        (item) => req.hostname === item.domain,
      )
      if (!websiteHosting) {
        return req.url
      }

      // req.url doesn't have hostname
      const minioUrl = new URL(req.url, Config.OSS_INTERNAL_ENDPOINT)
      const paths = tryPath(websiteHosting.bucketName, req.path)
      const getUrl = () => minioUrl.pathname + minioUrl.search

      for (const [idx, path] of paths.entries()) {
        minioUrl.pathname = path

        if (idx === paths.length - 1) {
          return getUrl()
        }

        try {
          await axios.head(minioUrl.toString())
          return getUrl()
        } catch (err) {
          if (err.response.status === 404) {
            continue
          }
          return getUrl()
        }
      }
    },
  }),
)

const storageServer = app.listen(Config.STORAGE_PORT, () =>
  logger.info(
    `storage server ${process.pid} listened on ${Config.STORAGE_PORT}`,
  ),
)

export default storageServer
