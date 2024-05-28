import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { PrometheusConf } from 'src/region/entities/region'
import { RegionService } from 'src/region/region.service'
import { GetApplicationNamespace } from 'src/utils/getter'

const requestConfig = {
  retryAttempts: 5,
  retryDelayBase: 300,
  rateAccuracy: '1m',
}

export const getQuery =
  ({ rateAccuracy }: { rateAccuracy: string }) =>
  (opts: Record<string, unknown>, metric: MonitorMetric) => {
    switch (metric) {
      case MonitorMetric.cpuUsage:
        return {
          instant: false,
          query: `sum(laf_runtime_cpu{container!="",appid="${opts.appid}"}) by (${opts.selector})`,
        }
      case MonitorMetric.memoryUsage:
        return {
          instant: false,
          query: `sum(laf_runtime_memory{container!="",appid="${opts.appid}"}) by (${opts.selector})`,
        }
      case MonitorMetric.networkReceive:
        return {
          instant: false,
          query: `sum(rate(container_network_receive_bytes_total{pod=~"${opts.pods}",namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`,
        }
      case MonitorMetric.networkTransmit:
        return {
          instant: false,
          query: `sum(rate(container_network_transmit_bytes_total{pod=~"${opts.pods}",namespace="${opts.namespace}"}[${rateAccuracy}])) by (${opts.selector})`,
        }
      case MonitorMetric.databaseUsage:
        return {
          instant: true,
          query: `sum(mongodb_dbstats_dataSize{database="${opts.appid}",rs_state="1"})`,
        }
      case MonitorMetric.storageUsage:
        return {
          instant: true,
          query: `sum(minio_bucket_usage_total_bytes{bucket=~"${opts.appid}.+"})`,
        }
    }
  }

export enum MonitorMetric {
  cpuUsage = 'cpuUsage',
  memoryUsage = 'memoryUsage',
  networkReceive = 'networkReceive',
  networkTransmit = 'networkTransmit',
  databaseUsage = 'databaseUsage',
  storageUsage = 'storageUsage',
}

@Injectable()
export class MonitorService {
  constructor(
    private readonly httpService: HttpService,
    private readonly regionService: RegionService,
  ) {}
  private readonly logger = new Logger(MonitorService.name)

  async getData(
    appid: string,
    metrics: MonitorMetric[],
    queryParams: Record<string, number | string>,
    isRange: boolean,
  ) {
    const region = await this.regionService.findByAppId(appid)
    const conf = region?.prometheusConf
    if (!conf?.apiUrl) {
      this.logger.warn('Metrics not available for no endpoint')
      return {}
    }

    const opts = {
      appid,
      selector: 'pod',
      namespace: GetApplicationNamespace(region, appid),
      pods: appid + '.+',
    }
    const data = {}
    const res = metrics.map(async (metric) => {
      const { query, instant } = getQuery({
        rateAccuracy: requestConfig.rateAccuracy,
      })(opts, metric)

      data[metric] =
        instant || !isRange
          ? await this.query(conf, query)
          : await this.queryRange(conf, query, queryParams)
    })

    await Promise.all(res)
    return data
  }

  private async query(conf: PrometheusConf, query: string) {
    const endpoint = `${conf.apiUrl}/api/v1/query`

    return await this.queryInternal(endpoint, { query })
  }

  private async queryRange(
    conf: PrometheusConf,
    query: string,
    queryParams: Record<string, number | string>,
  ) {
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

    const endpoint = `${conf.apiUrl}/api/v1/query_range`

    return await this.queryInternal(endpoint, {
      query,
      ...queryParams,
    })
  }

  private async queryInternal(
    endpoint: string,
    query: Record<string, string | number>,
  ) {
    for (let attempt = 1; attempt <= requestConfig.retryAttempts; attempt++) {
      try {
        const res = await this.httpService
          .post(endpoint, query, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .toPromise()

        return res.data.data.result
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
