import { Injectable, Logger } from '@nestjs/common'
import { CronTrigger } from '@prisma/client'
import { ClusterService } from 'src/region/cluster/cluster.service'
import * as assert from 'node:assert'
import { RegionService } from 'src/region/region.service'
import { GetApplicationNamespaceByAppId } from 'src/utils/getter'
import { FunctionService } from 'src/function/function.service'
import { FOREVER_IN_SECONDS, X_LAF_TRIGGER_TOKEN_KEY } from 'src/constants'

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name)

  constructor(
    private readonly clusterService: ClusterService,
    private readonly regionService: RegionService,
    private readonly funcService: FunctionService,
  ) {}

  async create(trigger: CronTrigger) {
    assert(trigger, 'cronTrigger is required')

    // get region by appid
    const appid = trigger.appid
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region is required')

    // create cronjob
    const ns = GetApplicationNamespaceByAppId(appid)
    const batchApi = this.clusterService.makeBatchV1Api(region)
    const name = `cron-${trigger.id}`
    const command = await this.getTriggerCommand(trigger)
    const res = await batchApi.createNamespacedCronJob(ns, {
      metadata: {
        name,
        labels: {
          appid,
          id: trigger.id,
        },
      },
      spec: {
        schedule: trigger.cron,
        successfulJobsHistoryLimit: 1,
        failedJobsHistoryLimit: 1,
        concurrencyPolicy: 'Allow',
        startingDeadlineSeconds: 60,
        jobTemplate: {
          spec: {
            activeDeadlineSeconds: 60,
            template: {
              spec: {
                restartPolicy: 'Never',
                terminationGracePeriodSeconds: 30,
                automountServiceAccountToken: false,
                containers: [
                  {
                    name: name,
                    image: 'curlimages/curl:7.87.0',
                    command: ['sh', '-c', command],
                    imagePullPolicy: 'IfNotPresent',
                  },
                ],
              },
            },
          },
        },
      },
    })

    this.logger.debug(`create cronjob ${name} success`)
    return res.body
  }

  async findOne(trigger: CronTrigger) {
    const appid = trigger.appid
    const ns = GetApplicationNamespaceByAppId(appid)
    const region = await this.regionService.findByAppId(appid)
    try {
      const batchApi = this.clusterService.makeBatchV1Api(region)
      const name = `cron-${trigger.id}`
      const res = await batchApi.readNamespacedCronJob(name, ns)
      return res.body
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  async delete(trigger: CronTrigger) {
    const appid = trigger.appid
    const ns = GetApplicationNamespaceByAppId(appid)
    const region = await this.regionService.findByAppId(appid)
    const batchApi = this.clusterService.makeBatchV1Api(region)
    const name = `cron-${trigger.id}`
    const res = await batchApi.deleteNamespacedCronJob(name, ns)
    return res.body
  }

  private async getTriggerCommand(trigger: CronTrigger) {
    const appid = trigger.appid
    const funcName = trigger.target
    const runtimeUrl = this.funcService.getInClusterRuntimeUrl(appid)
    const invokeUrl = `${runtimeUrl}/${funcName}`

    // get trigger token
    const token = await this.funcService.generateRuntimeToken(
      appid,
      'trigger',
      FOREVER_IN_SECONDS,
    )

    const command = `curl -X POST -H "${X_LAF_TRIGGER_TOKEN_KEY}: ${token}" ${invokeUrl}`
    return command
  }
}
