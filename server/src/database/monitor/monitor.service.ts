import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { Region } from 'src/region/entities/region'

const requestConfig = {
  retryAttempts: 5,
  retryDelayBase: 300,
  rateAccuracy: '1m',
}

@Injectable()
export class DedicatedDatabaseMonitorService {
  private readonly logger = new Logger(DedicatedDatabaseMonitorService.name)

  constructor(private readonly httpService: HttpService) {}

  async getResource(appid: string, region: Region) {
    const dbName = this.getDBName(appid)

    const cpu = await this.queryRange(
      region,
      `laf_mongo_cpu{appid="${appid}"}`,
      {
        labels: ['pod'],
      },
    )
    const memory = await this.queryRange(
      region,
      `laf_mongo_memory{appid="${appid}"}`,
      {
        labels: ['pod'],
      },
    )
    const dataSize = await this.query(
      region,
      `sum(mongodb_dbstats_dataSize{pod=~"${dbName}-mongo.+",rs_state="1"}) by (database)`,
      {
        labels: ['database'],
      },
    )

    return {
      cpu,
      memory,
      dataSize,
    }
  }

  async getConnection(appid: string, region: Region) {
    const dbName = this.getDBName(appid)
    const query = `mongodb_connections{pod=~"${dbName}-mongo.+",state="current"}`
    const connections = await this.queryRange(region, query, {
      labels: ['pod'],
    })
    return {
      connections,
    }
  }
  async getPerformance(appid: string, region: Region) {
    const dbName = this.getDBName(appid)
    const queries = {
      documentOperations: `rate(mongodb_mongod_metrics_document_total{pod=~"${dbName}-mongo.+"}[1m])`,
      queryOperations: `rate(mongodb_op_counters_total{pod=~"${dbName}-mongo.+"}[5m]) or irate(mongodb_op_counters_total{pod=~"${dbName}-mongo.+"}[5m])`,
      pageFaults: `rate(mongodb_extra_info_page_faults_total{pod=~"${dbName}-mongo.+"}[5m]) or irate(mongodb_extra_info_page_faults_total{pod=~"${dbName}-mongo.+"}[5m])`,
    }

    const res = await Promise.all(
      Object.keys(queries).map(async (key) => {
        const query = queries[key]
        const data = await this.queryRange(region, query, {
          labels: ['pod', 'type', 'state'],
        })
        return data
      }),
    )

    const keys = Object.keys(queries)
    return res.reduce((acc, cur, idx) => {
      acc[keys[idx]] = cur
      return acc
    }, {})
  }

  getDBName(appid: string) {
    return `${appid}`
  }

  private async query(
    region: Region,
    query: string,
    queryParams?: Record<string, number | string | string[]>,
  ) {
    const host = region.prometheusConf?.apiUrl
    if (!host) return []
    const endpoint = `${host}/api/v1/query`

    return await this.queryInternal(endpoint, { query, ...queryParams })
  }

  private async queryRange(
    region: Region,
    query: string,
    queryParams?: Record<string, number | string | string[]>,
  ) {
    const host = region.prometheusConf?.apiUrl
    if (!host) return []

    const range = 3600 // 1 hour
    const now = Math.floor(Date.now() / 1000)
    const start = now - range
    const end = now

    queryParams = {
      range,
      step: 60,
      start,
      end,
      ...queryParams,
    }

    const endpoint = `${host}/api/v1/query_range`

    return await this.queryInternal(endpoint, {
      query,
      ...queryParams,
    })
  }

  private async queryInternal(
    endpoint: string,
    query: Record<string, string | number | string[]>,
  ) {
    const labels = query.labels
    delete query['labels']
    for (let attempt = 1; attempt <= requestConfig.retryAttempts; attempt++) {
      try {
        const res = await this.httpService
          .post(endpoint, query, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .toPromise()

        if (!labels || !Array.isArray(labels)) return res.data.data.result

        return res.data.data.result.map((v) => {
          const metric = v.metric
          for (const item in metric) {
            if (!labels.includes(item)) {
              delete metric[item]
            }
          }
          return v
        })
      } catch (error) {
        if (attempt >= requestConfig.retryAttempts) {
          this.logger.error('Metrics not available', error.message)
          return []
        }

        await new Promise((resolve) =>
          setTimeout(resolve, attempt * requestConfig.retryDelayBase),
        )
      }
    }
  }
}
