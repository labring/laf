import { V1Deployment, V1DeploymentSpec } from '@kubernetes/client-node'
import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceByAppId } from '../utils/getter'
import {
  LABEL_KEY_APP_ID,
  LABEL_KEY_NODE_TYPE,
  MB,
  NodeType,
} from '../constants'
import { StorageService } from '../storage/storage.service'
import { DatabaseService } from 'src/database/database.service'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { SystemDatabase } from 'src/database/system-database'
import { ApplicationWithRelations } from 'src/application/entities/application'
import { ApplicationService } from 'src/application/application.service'

@Injectable()
export class InstanceService {
  private readonly logger = new Logger('InstanceService')
  private readonly db = SystemDatabase.db

  constructor(
    private readonly cluster: ClusterService,
    private readonly storageService: StorageService,
    private readonly databaseService: DatabaseService,
    private readonly applicationService: ApplicationService,
  ) {}

  public async create(appid: string) {
    const app = await this.applicationService.findOneUnsafe(appid)
    const labels = { [LABEL_KEY_APP_ID]: appid }
    const region = app.region

    // Although a namespace has already been created during application creation,
    // we still need to check it again here in order to handle situations where the cluster is rebuilt.
    const namespace = await this.cluster.getAppNamespace(region, appid)
    if (!namespace) {
      this.logger.debug(`Creating namespace for application ${appid}`)
      await this.cluster.createAppNamespace(
        region,
        appid,
        app.createdBy.toString(),
      )
    }

    // ensure deployment created
    const res = await this.get(app.appid)
    if (!res.deployment) {
      await this.createDeployment(app, labels)
    }

    // ensure service created
    if (!res.service) {
      await this.createService(app, labels)
    }
  }

  public async remove(appid: string) {
    const app = await this.applicationService.findOneUnsafe(appid)
    const region = app.region
    const { deployment, service } = await this.get(appid)

    const namespace = await this.cluster.getAppNamespace(region, app.appid)
    if (!namespace) return // namespace not found, nothing to do

    const appsV1Api = this.cluster.makeAppsV1Api(region)
    const coreV1Api = this.cluster.makeCoreV1Api(region)

    // ensure deployment deleted
    if (deployment) {
      await appsV1Api.deleteNamespacedDeployment(appid, namespace.metadata.name)
    }

    // ensure service deleted
    if (service) {
      const name = appid
      await coreV1Api.deleteNamespacedService(name, namespace.metadata.name)
    }
    this.logger.log(`remove k8s deployment ${deployment?.metadata?.name}`)
  }

  public async get(appid: string) {
    const app = await this.applicationService.findOneUnsafe(appid)
    const region = app.region
    const namespace = await this.cluster.getAppNamespace(region, app.appid)
    if (!namespace) {
      return { deployment: null, service: null }
    }

    const deployment = await this.getDeployment(app)
    const service = await this.getService(app)
    return { deployment, service }
  }

  public async restart(appid: string) {
    const app = await this.applicationService.findOneUnsafe(appid)
    const region = app.region
    const { deployment } = await this.get(appid)
    if (!deployment) {
      await this.create(appid)
      return
    }

    deployment.spec = await this.makeDeploymentSpec(
      app,
      deployment.spec.template.metadata.labels,
    )
    const appsV1Api = this.cluster.makeAppsV1Api(region)
    const namespace = GetApplicationNamespaceByAppId(appid)
    const res = await appsV1Api.replaceNamespacedDeployment(
      app.appid,
      namespace,
      deployment,
    )

    this.logger.log(`restart k8s deployment ${res.body?.metadata?.name}`)
  }

  private async createDeployment(app: ApplicationWithRelations, labels: any) {
    const appid = app.appid
    const namespace = GetApplicationNamespaceByAppId(appid)

    // create deployment
    const data = new V1Deployment()
    data.metadata = { name: app.appid, labels }
    data.spec = await this.makeDeploymentSpec(app, labels)

    const appsV1Api = this.cluster.makeAppsV1Api(app.region)
    const res = await appsV1Api.createNamespacedDeployment(namespace, data)

    this.logger.log(`create k8s deployment ${res.body?.metadata?.name}`)

    return res.body
  }

  private async createService(app: ApplicationWithRelations, labels: any) {
    const namespace = GetApplicationNamespaceByAppId(app.appid)
    const serviceName = app.appid
    const coreV1Api = this.cluster.makeCoreV1Api(app.region)
    const res = await coreV1Api.createNamespacedService(namespace, {
      metadata: { name: serviceName, labels },
      spec: {
        selector: labels,
        type: 'ClusterIP',
        ports: [{ port: 8000, targetPort: 8000, protocol: 'TCP' }],
      },
    })
    this.logger.log(`create k8s service ${res.body?.metadata?.name}`)
    return res.body
  }

  private async getDeployment(app: ApplicationWithRelations) {
    const appid = app.appid
    const appsV1Api = this.cluster.makeAppsV1Api(app.region)
    try {
      const namespace = GetApplicationNamespaceByAppId(appid)
      const res = await appsV1Api.readNamespacedDeployment(appid, namespace)
      return res.body
    } catch (error) {
      if (error?.response?.body?.reason === 'NotFound') return null
      throw error
    }
  }

  private async getService(app: ApplicationWithRelations) {
    const appid = app.appid
    const coreV1Api = this.cluster.makeCoreV1Api(app.region)

    try {
      const serviceName = appid
      const namespace = GetApplicationNamespaceByAppId(appid)
      const res = await coreV1Api.readNamespacedService(serviceName, namespace)
      return res.body
    } catch (error) {
      if (error?.response?.body?.reason === 'NotFound') return null
      throw error
    }
  }

  private async makeDeploymentSpec(
    app: ApplicationWithRelations,
    labels: any,
  ): Promise<V1DeploymentSpec> {
    // prepare params
    const limitMemory = app.bundle.resource.limitMemory
    const limitCpu = app.bundle.resource.limitCPU
    const requestMemory = app.bundle.resource.requestMemory
    const requestCpu = app.bundle.resource.requestCPU
    const max_old_space_size = ~~(limitMemory * 0.8)
    const max_http_header_size = 1 * MB
    const dependencies = app.configuration?.dependencies || []
    const dependencies_string = dependencies.join(' ')
    const npm_install_flags = app.region.clusterConf.npmInstallFlags || ''

    // db connection uri
    const database = await this.databaseService.findOne(app.appid)
    const dbConnectionUri = this.databaseService.getInternalConnectionUri(
      app.region,
      database,
    )

    const storage = await this.storageService.findOne(app.appid)

    const env = [
      { name: 'DB_URI', value: dbConnectionUri },
      { name: 'APP_ID', value: app.appid }, // deprecated, use `APPID` instead
      { name: 'APPID', value: app.appid },
      { name: 'OSS_ACCESS_KEY', value: storage.accessKey },
      { name: 'OSS_ACCESS_SECRET', value: storage.secretKey },
      {
        name: 'OSS_INTERNAL_ENDPOINT',
        value: app.region.storageConf.internalEndpoint,
      },
      {
        name: 'OSS_EXTERNAL_ENDPOINT',
        value: app.region.storageConf.externalEndpoint,
      },
      { name: 'OSS_REGION', value: app.region.name },
      {
        name: 'FLAGS',
        value: `--max_old_space_size=${max_old_space_size} --max-http-header-size=${max_http_header_size}`,
      },
      { name: 'DEPENDENCIES', value: dependencies_string },
      { name: 'NPM_INSTALL_FLAGS', value: npm_install_flags },
      {
        name: 'RESTART_AT',
        value: new Date().getTime().toString(),
      },
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

    const spec: V1DeploymentSpec = {
      replicas: 1,
      selector: { matchLabels: labels },
      template: {
        metadata: { labels },
        spec: {
          terminationGracePeriodSeconds: 10,
          automountServiceAccountToken: false,
          containers: [
            {
              image: app.runtime.image.main,
              imagePullPolicy: 'IfNotPresent',
              command: ['sh', '/app/start.sh'],
              name: app.appid,
              env,
              ports: [{ containerPort: 8000, name: 'http' }],
              resources: {
                limits: {
                  cpu: `${limitCpu}m`,
                  memory: `${limitMemory}Mi`,
                  'ephemeral-storage': '4Gi',
                },
                requests: {
                  cpu: `${requestCpu}m`,
                  memory: `${requestMemory}Mi`,
                  'ephemeral-storage': '64Mi',
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
                periodSeconds: 1,
                timeoutSeconds: 1,
                failureThreshold: 300,
              },
              readinessProbe: {
                httpGet: {
                  path: '/_/healthz',
                  port: 'http',
                  httpHeaders: [{ name: 'Referer', value: 'readinessProbe' }],
                },
                initialDelaySeconds: 0,
                periodSeconds: 60,
                timeoutSeconds: 3,
                failureThreshold: 1,
              },
              securityContext: {
                allowPrivilegeEscalation: false,
                readOnlyRootFilesystem: true,
                privileged: false,
              },
            },
          ],
          initContainers: [
            {
              name: 'init',
              image: app.runtime.image.init,
              imagePullPolicy: 'IfNotPresent',
              command: ['sh', '/app/init.sh'],
              env,
              volumeMounts: [
                {
                  name: 'app',
                  mountPath: '/tmp/app',
                },
              ],
              resources: {
                limits: {
                  cpu: `1000m`,
                  memory: `1024Mi`,
                  'ephemeral-storage': '4Gi',
                },
                requests: {
                  cpu: '5m',
                  memory: '32Mi',
                  'ephemeral-storage': '64Mi',
                },
              },
              securityContext: {
                allowPrivilegeEscalation: false,
                // readOnlyRootFilesystem: true,
                privileged: false,
              },
            },
          ],
          volumes: [
            {
              name: 'app',
              emptyDir: {
                sizeLimit: '4Gi',
              },
            },
          ],
          affinity: {
            nodeAffinity: {
              // required to schedule on runtime node
              requiredDuringSchedulingIgnoredDuringExecution: {
                nodeSelectorTerms: [
                  {
                    matchExpressions: [
                      {
                        key: LABEL_KEY_NODE_TYPE,
                        operator: 'In',
                        values: [NodeType.Runtime],
                      },
                    ],
                  },
                ],
              },
            }, // end of nodeAffinity {}
          }, // end of affinity {}
        }, // end of spec {}
      }, // end of template {}
    }
    return spec
  }
}
