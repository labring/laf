import Config from "../config"
import { getToken } from "../utils/token"
import axios from 'axios'
import assert = require("assert")


export enum BucketMode {
  PRIVATE = 0,
  PUBLIC_READ = 1,
  PUBLIC_READ_WRITE = 2
}

export class StorageAgent {

  /**
   * Storage API entry point
   */
  get entrypoint() {
    return Config.STORAGE_SERVICE_CONFIG.entrypoint
  }

  /**
   * Create bucket
   * @param name bucket name
   * @param mode bucket mode
   * @param secret bucket secret
   * @returns bucket id or undefined
   */
  public async createBucket(name: string, mode: BucketMode, secret: string): Promise<{ code: string, data: any }> {
    assert.ok(name, 'empty name got')
    assert.ok(mode !== undefined, 'undefined mode got')
    assert.ok(secret, 'empty secret got')

    const token = this.generateToken()
    const res = await axios({
      method: 'post',
      url: this.entrypoint + `/sys/buckets?token=${token}`,
      data: { name, mode, secret }
    })

    return res.data
  }

  /**
   * Update bucket
   * @param name bucket name
   * @param mode bucket mode
   * @param secret bucket secret
   * @returns 
   */
  public async updateBucket(name: string, mode: BucketMode, secret?: string): Promise<{ code: string | number, data: any }> {
    assert.ok(name, 'empty name got')

    const token = this.generateToken()
    const res = await axios({
      method: 'put',
      url: this.entrypoint + `/sys/buckets/${name}?token=${token}`,
      data: { mode, secret }
    })

    return res.data
  }

  /**
   * Delete bucket
   * @param name bucket name
   * @returns 
   */
  public async deleteBucket(name: string): Promise<{ code: string, data: any }> {
    assert.ok(name, 'empty name got')

    const token = this.generateToken()
    const res = await axios({
      method: 'delete',
      url: this.entrypoint + `/sys/buckets/${name}?token=${token}`
    })

    return res.data
  }

  /**
   * Generate token
   * @returns 
   */
  generateToken() {
    const exp = ~~(Date.now() / 1000 + 60)
    return getToken({ src: 'sys', exp }, Config.STORAGE_SERVICE_CONFIG.secret)
  }
}