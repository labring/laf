import { V1Deployment } from '@kubernetes/client-node'
import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceById } from '../utils/getter'
import { ResourceLabels, ServerConfig } from '../constants'
import { DatabaseCoreService } from '../core/database.cr.service'
import { KubernetesService } from '../core/kubernetes.service'
import { OSSUserCoreService } from '../core/oss-user.cr.service'
import { PrismaService } from '../prisma.service'

@Injectable()
export class InstanceService {
  private logger = new Logger('InstanceService')
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly databaseCore: DatabaseCoreService,
    private readonly ossCore: OSSUserCoreService,
    private readonly prisma: PrismaService,
  ) {}

  async create(appid: string) {
    const labels = { [ResourceLabels.APP_ID]: appid }

    const res = await this.get(appid)
    if (!res.deployment) {
      await this.createDeployment(appid, labels)
    }

    if (!res.service) {
      await this.createService(appid, labels)
    }
  }

  async createDeployment(appid: string, labels: any) {
    const namespace = GetApplicationNamespaceById(appid)
    const app = await this.prisma.application.findUnique({
      where: { appid },
      include: {
        configuration: true,
        bundle: true,
        runtime: true,
        region: true,
      },
    })
    const database = await this.databaseCore.findOne(appid)
    const oss = await this.ossCore.findOne(appid)

    // prepare params
    const limitMemory = app.bundle.limitMemory
    const limitCpu = app.bundle.limitCPU
    const requestMemory = app.bundle.requestMemory
    const requestCpu = app.bundle.requestCPU
    const max_old_space_size = ~~(limitMemory * 0.8)
    const dependencies = app.configuration?.dependencies || []
    const dependencies_string = dependencies.join(' ')

    const env = [
      { name: 'DB_URI', value: database.status?.connectionUri },
      { name: 'APP_ID', value: app.appid },
      { name: 'OSS_ACCESS_KEY', value: oss.status?.accessKey },
      { name: 'OSS_ACCESS_SECRET', value: oss.status?.secretKey },
      { name: 'OSS_INTERNAL_ENDPOINT', value: oss.status?.endpoint },
      { name: 'OSS_EXTERNAL_ENDPOINT', value: ServerConfig.OSS_ENDPOINT },
      { name: 'OSS_REGION', value: oss.status?.region },
      { name: 'FLAGS', value: `--max_old_space_size=${max_old_space_size}` },
      { name: 'DEPENDENCIES', value: dependencies_string },
    ]

    // merge env from app configuration, override if exists
    const extraEnv = app.configuration.environments || []
    extraEnv.forEach((e) => {
      const index = env.findIndex((x) => x.name === e.name)
      if (index > -1) {
        env[index] = e
      } else {
        env.push(e)
      }
    })

    // create deployment
    const data = new V1Deployment()
    data.metadata = { name: app.appid, labels }
    data.spec = {
      replicas: 1,
      selector: { matchLabels: labels },
      template: {
        metadata: { labels },
        spec: {
          terminationGracePeriodSeconds: 15,
          automountServiceAccountToken: false,
          containers: [
            {
              image: app.runtime.image.main,
              imagePullPolicy: 'Always',
              command: ['sh', '/app/start.sh'],
              name: app.appid,
              env,
              ports: [{ containerPort: 8000, name: 'http' }],
              resources: {
                limits: {
                  cpu: `${limitCpu}m`,
                  memory: `${limitMemory}Mi`,
                },
                requests: {
                  cpu: `${requestCpu}m`,
                  memory: `${requestMemory}Mi`,
                },
              },
              volumeMounts: [
                {
                  name: 'app',
                  mountPath: '/app',
                },
              ],
              startupProbe: {
                httpGet: {
                  path: '/_/healthz',
                  port: 'http',
                  httpHeaders: [{ name: 'Referer', value: 'startupProbe' }],
                },
                initialDelaySeconds: 0,
                periodSeconds: 3,
                timeoutSeconds: 3,
                failureThreshold: 240,
              },
              readinessProbe: {
                httpGet: {
                  path: '/_/healthz',
                  port: 'http',
                  httpHeaders: [{ name: 'Referer', value: 'readinessProbe' }],
                },
                initialDelaySeconds: 0,
                periodSeconds: 60,
                timeoutSeconds: 5,
                failureThreshold: 3,
              },
            },
          ],
          initContainers: [
            {
              name: 'init',
              image: app.runtime.image.init,
              imagePullPolicy: 'Always',
              command: ['sh', '/app/init.sh'],
              env,
              volumeMounts: [
                {
                  name: 'app',
                  mountPath: '/tmp/app',
                },
              ],
            },
          ],
          volumes: [
            {
              name: 'app',
              emptyDir: {},
            },
          ],
        },
      },
    }

    const res = await this.k8sService.appsV1Api.createNamespacedDeployment(
      namespace,
      data,
    )

    this.logger.log(`create k8s deployment ${res.body?.metadata?.name}`)

    return res.body
  }

  async createService(appid: string, labels: any) {
    const namespace = GetApplicationNamespaceById(appid)
    const serviceName = appid
    const res = await this.k8sService.coreV1Api.createNamespacedService(
      namespace,
      {
        metadata: { name: serviceName, labels },
        spec: {
          selector: labels,
          type: 'ClusterIP',
          ports: [{ port: 8000, targetPort: 8000, protocol: 'TCP' }],
        },
      },
    )
    this.logger.log(`create k8s service ${res.body?.metadata?.name}`)
    return res.body
  }

  async remove(appid: string) {
    const { deployment, service } = await this.get(appid)
    const namespace = GetApplicationNamespaceById(appid)
    if (deployment) {
      await this.k8sService.appsV1Api.deleteNamespacedDeployment(
        appid,
        namespace,
      )
    }
    if (service) {
      const name = appid
      await this.k8sService.coreV1Api.deleteNamespacedService(name, namespace)
    }
  }

  async get(appid: string) {
    const deployment = await this.getDeployment(appid)
    const service = await this.getService(appid)
    return { deployment, service }
  }

  async getDeployment(appid: string) {
    try {
      const namespace = GetApplicationNamespaceById(appid)
      const res = await this.k8sService.appsV1Api.readNamespacedDeployment(
        appid,
        namespace,
      )
      return res.body
    } catch (error) {
      if (error?.response?.body?.reason === 'NotFound') return null
      return null
    }
  }

  async getService(appid: string) {
    try {
      const serviceName = appid
      const namespace = GetApplicationNamespaceById(appid)
      const res = await this.k8sService.coreV1Api.readNamespacedService(
        serviceName,
        namespace,
      )
      return res.body
    } catch (error) {
      return null
    }
  }
}
