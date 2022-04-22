import * as Docker from 'dockerode'
import { IApplicationData, getApplicationDbUri } from './application'
import Config from '../config'
import { logger } from '../logger'
import { ServiceDriverInterface } from './service-operator'
import { ApplicationSpecSupport } from './application-spec'
import * as assert from 'assert'
import { MB, SYSTEM_EXTENSION_APPID } from '../constants'


export class DockerContainerServiceDriver implements ServiceDriverInterface {
  docker: Docker

  constructor(options?: Docker.DockerOptions) {
    this.docker = new Docker(options)
  }

  /**
    * Get name of service
    * @param app 
    */
  getName(app: IApplicationData): string {
    return `app-${app.appid}`
  }

  /**
   * Start application service
   * @param app 
   * @returns the container id
   */
  async startService(app: IApplicationData) {
    let container = this.getContainer(app)
    const info = await this.info(app)
    if (!info) {
      container = await this.createService(app)
    }

    if (info?.State?.Running || info?.State?.Restarting) {
      return container.id
    }

    await container.start()
    logger.debug(`start container ${container.id} of app ${app.appid}`)

    return container.id
  }

  /**
   * Remove application service
   * @param app 
   */
  async removeService(app: IApplicationData) {
    const info = await this.info(app)
    if (!info) {
      return
    }

    const container = this.getContainer(app)
    if (info.State.Running) {
      await container.stop()
    }

    if (info.State.Restarting) {
      await container.stop()
    }

    await container.remove()
    logger.debug(`stop & remove container ${container.id} of app ${app.appid}`)

    return container.id
  }

  /**
   * Get container info
   * @param container 
   * @returns return null if container not exists
   */
  async info(app: IApplicationData): Promise<Docker.ContainerInspectInfo> {
    try {
      const container = this.getContainer(app)
      const info = await container.inspect()
      return info
    } catch (error) {
      if (error.reason === 'no such container') {
        return null
      }
      throw error
    }
  }

  /**
   * Create application service
   * @param app 
   * @returns 
   */
  private async createService(app: IApplicationData) {
    const uri = getApplicationDbUri(app)
    const app_spec = await ApplicationSpecSupport.getValidAppSpec(app.appid)
    assert.ok(app_spec, `no spec avaliable with app: ${app.appid}`)

    const limit_memory = app_spec.spec.limit_memory
    const max_old_space_size = ~~(limit_memory / MB * 0.8)
    const limit_cpu = app_spec.spec.limit_cpu
    const image_name = app.runtime?.image ?? Config.APP_SERVICE_IMAGE
    const log_level = Config.LOG_LEVEL
    const npm_install_flags = Config.APP_SERVICE_ENV_NPM_INSTALL_FLAGS

    let binds = []
    // just for debug purpose in local development mode
    if (Config.DEBUG_BIND_HOST_APP_PATH) {
      binds = [`${Config.DEBUG_BIND_HOST_APP_PATH}:/app`]
    }

    if (app.appid === SYSTEM_EXTENSION_APPID) {
      binds.push('/var/run/docker.sock:/var/run/docker.sock:ro')
    }

    const container = await this.docker.createContainer({
      Image: image_name,
      Cmd: ['sh', '/app/start.sh'],
      name: this.getName(app),
      Env: [
        `DB=${app.config.db_name}`,
        `DB_URI=${uri}`,
        `LOG_LEVEL=${log_level}`,
        `ENABLE_CLOUD_FUNCTION_LOG=always`,
        `SERVER_SECRET_SALT=${app.config.server_secret_salt}`,
        `OSS_ACCESS_SECRET=${app.config.oss_access_secret}`,
        `OSS_INTERNAL_ENDPOINT=${Config.MINIO_CONFIG.endpoint.internal}`,
        `OSS_EXTERNAL_ENDPOINT=${Config.MINIO_CONFIG.endpoint.external}`,
        `OSS_REGION=${Config.MINIO_CONFIG.region}`,
        `FLAGS=--max_old_space_size=${max_old_space_size}`,
        `APP_ID=${app.appid}`,
        `RUNTIME_IMAGE=${image_name}`,
        `NPM_INSTALL_FLAGS=${npm_install_flags}`
      ],
      ExposedPorts: {
        "8000/tcp": {}
      },
      HostConfig: {
        Memory: limit_memory,
        CpuShares: limit_cpu,
        Binds: binds
      },
    })

    logger.debug(`create container ${container.id} of app ${app.appid}`)

    // add the the app network
    const net = await this.getSharedNetwork()
    await net.connect({ Container: container.id })

    return container
  }

  private getContainer(app: IApplicationData) {
    const name = this.getName(app)
    return this.docker.getContainer(name)
  }

  /**
   * Get or create the shared network
   * @returns 
   */
  private async getSharedNetwork() {
    const name = Config.DOCKER_SHARED_NETWORK
    let net = this.docker.getNetwork(name)
    const info = await net.inspect()
    if (!info) {
      net = await this.docker.createNetwork({
        Name: name,
        Driver: 'bridge'
      })
    }

    return net
  }
}