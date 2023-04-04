import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { Region, WebsiteHosting } from '@prisma/client'
import { GetApplicationNamespaceByAppId } from '../utils/getter'

@Injectable()
export class ApisixService {
  private readonly logger = new Logger(ApisixService.name)

  constructor(private readonly httpService: HttpService) {}

  async createAppRoute(region: Region, appid: string, domain: string) {
    const host = domain
    const namespace = GetApplicationNamespaceByAppId(appid)
    const upstreamNode = `${appid}.${namespace}:8000`

    // TODO: use appid as route id instead of `app-{appid}
    const id = `app-${appid}`
    const data = {
      name: id,
      labels: {
        type: 'runtime',
        appid: appid,
      },
      uri: '/*',
      hosts: [host],
      priority: 9,
      upstream: {
        type: 'roundrobin',
        nodes: {
          [upstreamNode]: 1,
        },
      },
      timeout: {
        connect: 60,
        send: 600,
        read: 600,
      },
      plugins: {
        cors: {},
      },
      enable_websocket: true,
    }

    const res = await this.putRoute(region, id, data)
    return res
  }

  async deleteAppRoute(region: Region, appid: string) {
    // TODO: use appid as route id instead of `app-{appid}`
    const id = `app-${appid}`
    const res = await this.deleteRoute(region, id)
    return res
  }

  async createBucketRoute(region: Region, bucketName: string, domain: string) {
    const host = domain

    const minioUrl = new URL(region.storageConf.internalEndpoint)
    const upstreamNode = minioUrl.host

    // TODO: use bucket object id as route id instead of bucket name
    const id = `bucket-${bucketName}`
    const data = {
      name: id,
      labels: {
        type: 'bucket',
        bucket: bucketName,
      },
      uri: '/*',
      hosts: [host],
      priority: 9,
      upstream: {
        type: 'roundrobin',
        nodes: {
          [upstreamNode]: 1,
        },
      },
      timeout: {
        connect: 60,
        send: 600,
        read: 600,
      },
      plugins: {
        cors: {},
      },
    }

    const res = await this.putRoute(region, id, data)
    return res
  }

  async deleteBucketRoute(region: Region, bucketName: string) {
    // TODO: use bucket object id as route id instead of bucket name
    const id = `bucket-${bucketName}`
    const res = await this.deleteRoute(region, id)
    return res
  }

  async createWebsiteRoute(
    region: Region,
    website: WebsiteHosting,
    bucketDomain: string,
  ) {
    const host = website.domain
    const minioUrl = new URL(region.storageConf.internalEndpoint)
    const upstreamNode = minioUrl.host
    const upstreamHost = bucketDomain

    const id = `${website['_id']}`
    const name = `website-${id}`
    const data = {
      name: name,
      labels: {
        customDomain: website.isCustom ? 'true' : 'false',
        type: 'website',
      },
      uri: '/*',
      hosts: [host],
      priority: 20,
      upstream: {
        type: 'roundrobin',
        pass_host: 'rewrite',
        upstream_host: upstreamHost,
        nodes: {
          [upstreamNode]: 1,
        },
      },
      timeout: {
        connect: 60,
        send: 60,
        read: 60,
      },
      plugins: {
        'proxy-rewrite': {
          regex_uri: ['/$', '/index.html'],
        },
      },
    }

    const res = await this.putRoute(region, id, data)
    return res
  }

  async deleteWebsiteRoute(region: Region, website: WebsiteHosting) {
    const id = `${website['_id']}`
    const res = await this.deleteRoute(region, id)
    return res
  }

  async putRoute(region: Region, id: string, data: any) {
    const conf = region.gatewayConf
    const api_url = `${conf.apiUrl}/routes/${id}`

    const res = await this.httpService.axiosRef.put(api_url, data, {
      headers: {
        'X-API-KEY': conf.apiKey,
        'Content-Type': 'application/json',
      },
    })
    return res.data
  }

  async getRoute(region: Region, id: string) {
    const conf = region.gatewayConf
    const api_url = `${conf.apiUrl}/routes/${id}`

    try {
      const res = await this.httpService.axiosRef.get(api_url, {
        headers: {
          'X-API-KEY': conf.apiKey,
          'Content-Type': 'application/json',
        },
      })
      return res.data
    } catch (error) {
      if (error?.response?.status === 404) {
        return null
      }
      this.logger.error(error, error.response?.data)
      throw error
    }
  }

  async deleteRoute(region: Region, id: string) {
    const conf = region.gatewayConf
    const api_url = `${conf.apiUrl}/routes/${id}`

    const res = await this.httpService.axiosRef.delete(api_url, {
      headers: {
        'X-API-KEY': conf.apiKey,
        'Content-Type': 'application/json',
      },
    })

    return res.data
  }
}
