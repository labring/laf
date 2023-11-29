import * as http from 'http'
import Config from './config'
import { logger } from './support/logger'
import './support/cloud-sdk'
import { WebsiteHostingChangeStream } from './support/database-change-stream/website-hosting-change-stream'
import axios, { AxiosError } from 'axios'
import { finished } from 'stream'

const tryPath = (bucket: string, path: string): string[] => {
  return path.endsWith('/')
    ? [`/${bucket}${path}index.html`, `/${bucket}/index.html`]
    : [
        `/${bucket}${path}`,
        `/${bucket}${path}/index.html`,
        `/${bucket}/index.html`,
      ]
}

const websiteHostingPathHandler = async (
  host: string,
  url: string,
): Promise<string> => {
  const websiteHosting = WebsiteHostingChangeStream.websiteHosting.find(
    (item) => host === item.domain,
  )
  if (!websiteHosting) {
    return url
  }

  const minioUrl = new URL(url, Config.OSS_INTERNAL_ENDPOINT)
  const paths = tryPath(websiteHosting.bucketName, url)

  for (const path of paths) {
    minioUrl.pathname = path
    try {
      await axios.head(minioUrl.toString())
      return minioUrl.pathname + minioUrl.search
    } catch (err) {
      if ((err as AxiosError).response?.status !== 404) {
        break
      }
    }
  }
  return url // If all paths are unavailable, the original URL is returned.
}

const storageServer = http.createServer(
  async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const headers = {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers)
      res.end()
      return
    }

    const proxyReqUrl = new URL(Config.OSS_INTERNAL_ENDPOINT)

    const path = await websiteHostingPathHandler(req.headers.host, req.url)

    const proxyReq = http.request({
      host: proxyReqUrl.hostname,
      port: proxyReqUrl.port,
      headers: req.headers,
      method: req.method,
      path: path,
    })

    proxyReq.on('response', (proxyRes: http.IncomingMessage) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers)
      proxyRes.pipe(res)
    })

    req.pipe(proxyReq)

    finished(proxyReq, (err) => {
      if (err) {
        logger.error('Proxy request stream error:', err)
        res.writeHead(500)
        res.end('Internal Server Error')
        proxyReq.removeAllListeners()
        proxyReq.destroy()
      } else {
        proxyReq.removeAllListeners()
        proxyReq.destroy()
      }
    })

    finished(req, (err) => {
      if (err) {
        logger.error('Request stream error:', err)
        res.writeHead(500)
        res.end('Internal Server Error')
        req.destroy()
      } else {
        req.destroy()
      }
    })

    finished(res, (err) => {
      if (err) {
        logger.error('Response stream error:', err)
        res.writeHead(500)
        res.end('Internal Server Error')
        res.destroy()
      } else {
        res.destroy()
      }
    })
  },
)

storageServer.listen(Config.STORAGE_PORT, () => {
  logger.info(
    `Storage server ${process.pid} listened on ${Config.STORAGE_PORT}`,
  )
})

export default storageServer
