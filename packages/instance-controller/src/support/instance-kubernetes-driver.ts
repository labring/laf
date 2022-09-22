import * as k8s from '@kubernetes/client-node'
import { IApplicationData, getApplicationDbUri, InstanceStatus } from './application'
import Config from '../config'
import { MB } from './constants'
import { logger } from './logger'
import { InstanceDriverInterface } from './instance-operator'
import { ApplicationSpecSupport } from './application-spec'
import * as assert from 'assert'

export class KubernetesDriver implements InstanceDriverInterface {
  namespace = Config.KUBE_NAMESPACE_OF_APP_SERVICES
  apps_api: k8s.AppsV1Api
  core_api: k8s.CoreV1Api
  net_api: k8s.NetworkingV1Api

  constructor(options?: any) {
    const kc = new k8s.KubeConfig()
    kc.loadFromDefault(options)
    this.apps_api = kc.makeApiClient(k8s.AppsV1Api)
    this.core_api = kc.makeApiClient(k8s.CoreV1Api)
    this.net_api = kc.makeApiClient(k8s.NetworkingV1Api)
  }

  /**
   * Get name of service
   * @param app 
   */
  public getName(app: IApplicationData): string {
    return `app-${app.appid}`
  }

  /**
   * Start application service
   * @param app 
   * @returns the container id
   */
  public async create(app: IApplicationData) {
    const labels = { appid: app.appid, type: 'laf-app' }

    const info = await this.inspect(app)
    let deployment = info?.deployment
    if (!deployment) {
      deployment = await this.createK8sDeployment(app, labels)
    }

    if (!info?.service) {
      await this.createK8sService(app, labels)
    }

    return true
  }

  /**
   * Remove application service
   * @param app 
   */
  public async remove(app: IApplicationData) {
    const info = await this.inspect(app)
    if (!info) return

    if (info?.deployment) {
      const res_deploy = await this.apps_api.deleteNamespacedDeployment(this.getName(app), this.namespace)
      logger.info(`remove k8s deployment of app ${app.appid}`)
      logger.debug(`removed k8s deployment of app ${app.appid}:`, res_deploy.body)
    }

    if (info?.service) {
      const res_svc = await this.core_api.deleteNamespacedService(this.getName(app), this.namespace)
      logger.info(`remove k8s service of app ${app.appid}`)
      logger.debug(`removed k8s service of app ${app.appid}:`, res_svc.body)
    }

    return true
  }

  /**
   * Get instance info
   * @returns return null if container not exists
   */
  public async inspect(app: IApplicationData) {
    const name = this.getName(app)
    const deployment = await this.getK8sDeployment(name)
    const service = await this.getK8sService(name)
    return { deployment, service }
  }

  /**
   * Get instance status
   * @param app 
   * @returns 
   */
  public async status(app: IApplicationData) {
    const res = await this.inspect(app)
    const deployment = res?.deployment
    if (!deployment) return InstanceStatus.STOPPED

    const state = deployment.status
    if (state.readyReplicas > 0)
      return InstanceStatus.RUNNING

    return InstanceStatus.STOPPING
  }

  /**
   * Create k8s deployment for app
   * @param app 
   * @returns 
   */
  private async createK8sDeployment(app: IApplicationData, labels: any) {
    const uri = getApplicationDbUri(app)

    const app_spec = await ApplicationSpecSupport.getValidAppSpec(app.appid)
    assert.ok(app_spec, `no spec avaliable with app: ${app.appid}`)
    assert.ok(app.runtime?.image, `empty app runtime image got: ${app.appid}`)

    const limit_memory = ~~(app_spec.spec.limit_memory / MB)
    const limit_cpu = app_spec.spec.limit_cpu

    const req_cpu = app_spec.spec.request_cpu
    const req_memory = ~~(app_spec.spec.request_memory / MB)

    const image_name = app.runtime?.image
    const max_old_space_size = ~~(limit_memory * 0.8)
    const log_level = Config.LOG_LEVEL
    const npm_install_flags = Config.APP_SERVICE_ENV_NPM_INSTALL_FLAGS


    // create k8s deployment
    const { body: deployment } = await this.apps_api.createNamespacedDeployment(this.namespace, {
      metadata: {
        name: this.getName(app),
        labels: labels
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: labels
        },
        template: {
          metadata: {
            labels: labels
          },
          spec: {
            terminationGracePeriodSeconds: 15,
            automountServiceAccountToken: app.appid === Config.SYSTEM_EXTENSION_APPID,
            containers: [
              {
                image: image_name,
                command: ['sh', '/app/start.sh'],
                name: this.getName(app),
                env: [
                  { name: 'DB', value: app.config.db_name },
                  { name: 'DB_URI', value: uri },
                  { name: 'LOG_LEVEL', value: log_level },
                  { name: 'ENABLE_CLOUD_FUNCTION_LOG', value: 'always' },
                  { name: 'SERVER_SECRET_SALT', value: app.config.server_secret_salt },
                  { name: 'APP_ID', value: app.appid },
                  { name: 'RUNTIME_IMAGE', value: app.runtime?.image },
                  { name: 'FLAGS', value: `--max_old_space_size=${max_old_space_size}` },
                  { name: 'NPM_INSTALL_FLAGS', value: npm_install_flags },
                  { name: 'OSS_ACCESS_SECRET', value: app.config.oss_access_secret },
                  { name: 'OSS_INTERNAL_ENDPOINT', value: Config.MINIO_CONFIG.endpoint.internal },
                  { name: 'OSS_EXTERNAL_ENDPOINT', value: Config.MINIO_CONFIG.endpoint.external },
                  { name: 'OSS_REGION', value: Config.MINIO_CONFIG.region },
                ],
                ports: [{ containerPort: 8000, name: 'http' }],
                resources: {
                  requests: {
                    memory: `${req_memory}Mi`,
                    cpu: `${req_cpu}m`
                  },
                  limits: {
                    memory: `${limit_memory}Mi`,
                    cpu: `${limit_cpu}m`
                  }
                },
                startupProbe: {
                  httpGet: {
                    path: '/healthz',
                    port: 'http',
                    httpHeaders: [{ name: 'Referer', value: 'startupProbe' }]
                  },
                  initialDelaySeconds: 0,
                  periodSeconds: 3,
                  timeoutSeconds: 3,
                  failureThreshold: 240
                },
                readinessProbe: {
                  httpGet: {
                    path: '/healthz',
                    port: 'http',
                    httpHeaders: [{ name: 'Referer', value: 'readinessProbe' }]
                  },
                  initialDelaySeconds: 0,
                  periodSeconds: 60,
                  timeoutSeconds: 5,
                  failureThreshold: 3
                },
              }
            ],
          }
        }
      }
    })

    logger.info(`create k8s deployment ${deployment.metadata.name} of app ${app.appid}`)
    logger.debug(`created k8s deployment of app ${app.appid}:`, deployment)

    return deployment
  }

  /**
   * Create k8s service for app
   * @param app 
   * @param labels 
   * @returns 
   */
  private async createK8sService(app: IApplicationData, labels: any) {
    const { body: service } = await this.core_api.createNamespacedService(this.namespace, {
      metadata: { name: this.getName(app) },
      spec: {
        selector: labels,
        type: 'ClusterIP',
        ports: [{
          targetPort: 8000,
          port: 8000
        }]
      }
    })

    logger.info(`create k8s service ${service.metadata.name} of app ${app.appid}`)
    logger.debug(`created k8s service of app ${app.appid}:`, service)

    return service
  }

  private async getK8sDeployment(name: string) {
    try {
      const res = await this.apps_api.readNamespacedDeployment(name, this.namespace)
      return res.body
    } catch (error) {
      return null
    }
  }

  private async getK8sService(name: string) {
    try {
      const res = await this.core_api.readNamespacedService(name, this.namespace)
      return res.body
    } catch (error) {
      return null
    }
  }
}