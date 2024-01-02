import { Db } from 'database-proxy'
import request, { AxiosStatic } from 'axios'
import {
  CloudSdkInterface,
  GetTokenFunctionType,
  InvokeFunctionType,
  MongoDriverObject,
  ParseTokenFunctionType,
} from './cloud.interface'
import { WebSocket } from 'ws'
import { CloudStorage } from './storage'

export class Cloud implements CloudSdkInterface {
  /**
   * This method should be overwrite
   * @returns
   */
  static create: () => CloudSdkInterface

  private _cloud: CloudSdkInterface

  private get cloud(): CloudSdkInterface {
    if (globalThis.createCloudSdk && !Cloud.create) {
      Cloud.create = globalThis.createCloudSdk
    }

    if (!this._cloud) {
      this._cloud = Cloud.create()
    }
    return this._cloud
  }

  /**
   * Sending an HTTP request is actually an Axios instance. You can refer to the Axios documentation directly.
   * @deprecated this is deprecated and will be removed in future, use the global `fetch()` directly @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
   * @see https://axios-http.com/docs/intro
   */
  fetch: AxiosStatic = request

  database(): Db {
    return this.cloud.database()
  }

  /**
   * Invoke cloud function
   * @deprecated Just import the cloud function directly, and then call it
   */
  invoke: InvokeFunctionType = (name: string, param?: any) => {
    return this.cloud.invoke(name, param)
  }

  getToken: GetTokenFunctionType = (param: any) => {
    return this.cloud.getToken(param)
  }

  parseToken: ParseTokenFunctionType = (token: string) => {
    return this.cloud.parseToken(token)
  }

  get shared(): Map<string, any> {
    return this.cloud.shared
  }

  get mongo(): MongoDriverObject {
    return this.cloud.mongo
  }

  get sockets(): Set<WebSocket> {
    return this.cloud.sockets
  }

  get appid(): string {
    return this.cloud.appid
  }

  /**
   * @deprecated this is deprecated and will be removed in future, use `process.env` instead
   */
  get env() {
    return this.cloud.env
  }

  storage: CloudStorage = new CloudStorage()
}
