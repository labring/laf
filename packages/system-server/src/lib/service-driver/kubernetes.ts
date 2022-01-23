import * as k8s from '@kubernetes/client-node'
import { ApplicationStruct, getApplicationDbUri } from '../../api/application'
import Config from '../../config'
import { Constants } from '../../constants'
import { logger } from '../logger'
import { ServiceDriverInterface } from './interface'


export class KubernetesServiceDriver implements ServiceDriverInterface {
  namespace = "laf"
  apps_api: k8s.AppsV1Api
  core_api: k8s.CoreV1Api

  constructor(options?: any) {
    const kc = new k8s.KubeConfig()
    kc.loadFromDefault(options)
    this.apps_api = kc.makeApiClient(k8s.AppsV1Api)
    this.core_api = kc.makeApiClient(k8s.CoreV1Api)
  }

  /**
   * Get name of service
   * @param app 
   */
  getName(app: ApplicationStruct): string {
    return `app-${app.appid}`
  }

  /**
   * Start application service
   * @param app 
   * @returns the container id
   */
  async startService(app: ApplicationStruct) {
    const labels = { appid: app.appid, type: 'laf-app' }

    const info = await this.info(app)
    let deployment = info?.deployment
    if (!deployment) {
      deployment = await this.createK8sDeployment(app, labels)
    }

    if (!info?.service) {
      await this.createK8sService(app, labels)
    }

    return deployment
  }

  /**
   * Remove application service
   * @param app 
   */
  async removeService(app: ApplicationStruct) {
    const info = await this.info(app)
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

    return app.appid
  }

  /**
   * Get container info
   * @param container 
   * @returns return null if container not exists
   */
  async info(app: ApplicationStruct) {
    try {
      const deployment = await this.getK8sDeployment(this.getName(app))
      const service = await this.getK8sService(this.getName(app))
      return { deployment, service }
    } catch (error) {
      throw error
    }
  }

  /**
   * Create k8s deployment for app
   * @param app 
   * @returns 
   */
  private async createK8sDeployment(app: ApplicationStruct, labels: any) {
    const uri = getApplicationDbUri(app)
    const memoryLimit = app.runtime?.metrics?.memory ?? Config.APP_SERVICE_MEMORY_LIMIT
    const max_old_space_size = ~~(memoryLimit * 0.8)
    // if no cpu-shares set, use memory limit as it
    const cpuShares = app.runtime?.metrics?.cpu_shares ?? Config.APP_SERVICE_CPU_SHARES
    const imageName = app.runtime?.image ?? Config.APP_SERVICE_IMAGE
    const logLevel = Config.LOG_LEVEL

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
            automountServiceAccountToken: app.appid === Constants.SYSTEM_EXTENSION_APPID,
            containers: [
              {
                image: imageName,
                command: ['sh', '/app/start.sh'],
                name: this.getName(app),
                env: [
                  { name: 'DB', value: app.config.db_name },
                  { name: 'DB_URI', value: uri },
                  { name: 'LOG_LEVEL', value: logLevel },
                  { name: 'ENABLE_CLOUD_FUNCTION_LOG', value: 'always' },
                  { name: 'SERVER_SECRET_SALT', value: app.config.server_secret_salt },
                  { name: 'APP_ID', value: app.appid },
                  { name: 'RUNTIME_IMAGE', value: app.runtime?.image },
                  { name: 'FLAGS', value: `--max_old_space_size=${max_old_space_size}` }
                ],
                ports: [{ containerPort: 8000 }],
                resources: {
                  limits: {
                    memory: `${memoryLimit}Mi`,
                    cpu: `${cpuShares}m`
                  }
                }
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
  private async createK8sService(app: ApplicationStruct, labels: any) {
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