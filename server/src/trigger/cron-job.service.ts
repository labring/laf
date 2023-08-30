import { Injectable, Logger } from '@nestjs/common'
import { ClusterService } from 'src/region/cluster/cluster.service'
import * as assert from 'node:assert'
import { RegionService } from 'src/region/region.service'
import { GetApplicationNamespace } from 'src/utils/getter'
import { FunctionService } from 'src/function/function.service'
import { FOREVER_IN_SECONDS, X_LAF_TRIGGER_TOKEN_KEY } from 'src/constants'
import { TriggerService } from './trigger.service'
import * as k8s from '@kubernetes/client-node'
import { CronTrigger, TriggerPhase } from './entities/cron-trigger'
import { Region } from 'src/region/entities/region'

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name)

  constructor(
    private readonly clusterService: ClusterService,
    private readonly regionService: RegionService,
    private readonly funcService: FunctionService,
    private readonly triggerService: TriggerService,
  ) {}

  async create(trigger: CronTrigger) {
    assert(trigger, 'cronTrigger is required')

    // get region by appid
    const appid = trigger.appid
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region is required')

    // create cronjob
    const ns = GetApplicationNamespace(region, appid)
    const batchApi = this.clusterService.makeBatchV1Api(region)
    const name = `cron-${trigger._id}`
    const command = await this.getTriggerCommand(region, trigger)
    const res = await batchApi.createNamespacedCronJob(ns, {
      metadata: {
        name,
        labels: {
          appid,
          id: trigger._id.toString(),
        },
      },
      spec: {
        schedule: trigger.cron,
        successfulJobsHistoryLimit: 1,
        failedJobsHistoryLimit: 1,
        suspend: false,
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
    const region = await this.regionService.findByAppId(appid)
    const ns = GetApplicationNamespace(region, appid)
    try {
      const batchApi = this.clusterService.makeBatchV1Api(region)
      const name = `cron-${trigger._id}`
      const res = await batchApi.readNamespacedCronJob(name, ns)
      return res.body
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      this.logger.error(err)
      this.logger.error(err?.response?.body)
      throw err
    }
  }

  async suspend(trigger: CronTrigger) {
    return await this.patchSuspend(trigger, true)
  }

  async resume(trigger: CronTrigger) {
    return await this.patchSuspend(trigger, false)
  }

  async suspendAll(appid: string) {
    const triggers = await this.triggerService.findAll(appid)
    for (const trigger of triggers) {
      if (trigger.phase !== TriggerPhase.Created) continue
      await this.suspend(trigger)
      this.logger.log(`suspend cronjob ${trigger._id} success of ${appid}`)
    }
  }

  async resumeAll(appid: string) {
    const triggers = await this.triggerService.findAll(appid)
    for (const trigger of triggers) {
      if (trigger.phase !== TriggerPhase.Created) continue
      await this.resume(trigger)
      this.logger.log(`resume cronjob ${trigger._id} success of ${appid}`)
    }
  }

  async delete(trigger: CronTrigger) {
    const appid = trigger.appid
    const region = await this.regionService.findByAppId(appid)
    const ns = GetApplicationNamespace(region, appid)
    const batchApi = this.clusterService.makeBatchV1Api(region)
    const name = `cron-${trigger._id}`
    const res = await batchApi.deleteNamespacedCronJob(name, ns)
    return res.body
  }

  private async getTriggerCommand(region: Region, trigger: CronTrigger) {
    const appid = trigger.appid
    const funcName = trigger.target
    const runtimeUrl = this.funcService.getInClusterRuntimeUrl(region, appid)
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

  private async patchSuspend(trigger: CronTrigger, suspend: boolean) {
    const appid = trigger.appid
    const region = await this.regionService.findByAppId(appid)

    const ns = GetApplicationNamespace(region, appid)
    const batchApi = this.clusterService.makeBatchV1Api(region)
    const name = `cron-${trigger._id}`
    const body = [{ op: 'replace', path: '/spec/suspend', value: suspend }]
    try {
      const res = await batchApi.patchNamespacedCronJob(
        name,
        ns,
        body,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: { 'Content-Type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH },
        },
      )
      return res.body
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      throw err
    }
  }
}
