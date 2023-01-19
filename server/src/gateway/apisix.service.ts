import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { Region } from '@prisma/client'
import { GetApplicationNamespaceById } from '../utils/getter'

@Injectable()
export class ApisixService {
  private readonly logger = new Logger(ApisixService.name)

  constructor(private readonly httpService: HttpService) {}

  async createAppRoute(region: Region, appid: string, domain: string) {
    const host = domain
    const namespace = GetApplicationNamespaceById(appid)
    const upstreamNode = `${appid}.${namespace}:8000`

    const id = `app-${appid}`
    const data = {
      name: id,
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
    const id = `app-${appid}`
    const res = await this.deleteRoute(region, id)
    return res
  }

  async createBucketRoute(region: Region, bucketName: string, domain: string) {
    const host = domain

    const minioUrl = new URL(region.storageConf.internalEndpoint)
    const upstreamNode = minioUrl.host

    const id = `bucket-${bucketName}`
    const data = {
      name: id,
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
    const id = `bucket-${bucketName}`
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
