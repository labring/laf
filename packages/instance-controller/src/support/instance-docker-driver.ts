import * as Docker from 'dockerode'
import { IApplicationData, getApplicationDbUri, InstanceStatus } from './application'
import Config from '../config'
import { logger } from './logger'
import { InstanceDriverInterface } from './instance-operator'
import { ApplicationSpecSupport } from './application-spec'
import * as assert from 'assert'
import { MB } from './constants'


export class DockerContainerDriver implements InstanceDriverInterface {
  docker: Docker

  constructor(options?: Docker.DockerOptions) {
    this.docker = new Docker(options)
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
    let container = this.getContainer(app)
    const info = await this.inspect(app)
    if (!info) {
      container = await this.createService(app)
    }

    if (info?.State?.Running) {
      return true
    }

    await container.start()
    logger.debug(`start container ${container.id} of app ${app.appid}`)

    return true
  }

  /**
   * Remove application service
   * @param app 
   */
  public async remove(app: IApplicationData) {
    const info = await this.inspect(app)
    if (!info) {
      return true
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

    return true
  }

  /**
   * Get container info
   * @returns return null if container not exists
   */
  public async inspect(app: IApplicationData): Promise<Docker.ContainerInspectInfo> {
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
   * Get instance status
   * @param app 
   * @returns 
   */
  public async status(app: IApplicationData): Promise<InstanceStatus> {
    const res = await this.inspect(app)
    if (!res) return InstanceStatus.STOPPED
    const state = res?.State
    if (state.Running)
      return InstanceStatus.RUNNING

    return InstanceStatus.STOPPING
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
    assert.ok(app.runtime?.image, `empty app runtime image got: ${app.appid}`)

    const limit_memory = app_spec.spec.limit_memory
    const max_old_space_size = ~~(limit_memory / MB * 0.8)
    const limit_cpu = app_spec.spec.limit_cpu
    const image_name = app.runtime?.image
    const log_level = Config.LOG_LEVEL
    const npm_install_flags = Config.APP_SERVICE_ENV_NPM_INSTALL_FLAGS

    let binds = []
    // just for debug purpose in local development mode
    if (Config.DEBUG_BIND_HOST_APP_PATH) {
      binds = [`${Config.DEBUG_BIND_HOST_APP_PATH}:/app`]
    }

    if (app.appid === Config.SYSTEM_EXTENSION_APPID) {
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