import * as assert from 'assert'
import { getApplicationByAppid } from './application'
import { ApplicationSpecSupport } from './application-spec'


export class OssSupport {
  /**
   * Get avaliable to allocating capacity of an app
   * @param appid 
   * @returns 
   */
  public static async getAppAvaliableCapacity(appid: string) {
    assert.ok(appid, 'empty appid got')

    const app_spec = await ApplicationSpecSupport.getValidAppSpec(appid)
    const cap = app_spec?.spec?.storage_capacity || 0

    const allocated = await this.getAppAllocatedCapacity(appid)
    return cap - allocated
  }


  /**
   * Get allocated capacity of an app
   * @param appid 
   * @returns 
   */
  public static async getAppAllocatedCapacity(appid: string) {
    const app = await getApplicationByAppid(appid)
    assert.ok(app, 'app not found')

    const buckets = app.buckets
    let allocated = 0
    for (let bucket of buckets)
      allocated = allocated + bucket.quota

    return allocated
  }
}