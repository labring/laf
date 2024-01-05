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
  private maxRetries = 3; // maximum number of retries
  private currentRetry = 0; // current retry attempt
  private delay = 1000; // initial delay in milliseconds
  private maxDelay = 10000; // maximum delay in milliseconds
  private s3Client: S3Client;
  private ListObjectsCommand: ListObjectsCommand;
  private PutObjectCommand: PutObjectCommand;
  
  /**
   * This method should be overwrite
   * @returns
   */
  static create: () => CloudSdkInterface

  private s3Client = new S3Client({/* add configuration here */});
  private ListObjectsCommand = new ListObjectsCommand({/* add configuration here */});
  private PutObjectCommand = new PutObjectCommand({/* add configuration here */});
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

  async listObjects(params: ListObjectsCommandInput) {
    try {
      // AWS S3 listObjects operation
      const data = await this.s3Client.send(new ListObjectsCommand(params));
      return data;
    } catch (err) {
      if (err.$metadata?.httpStatusCode === 503) {
        if (this.currentRetry < this.maxRetries) {
          const delay = Math.min(this.delay * Math.pow(2, this.currentRetry), this.maxDelay);
          this.currentRetry++;
          console.warn(`Received 503 error. Retrying after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.listObjects(params);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }

  async putObject(params: PutObjectCommandInput) {
    try {
      // AWS S3 putObject operation
      const data = await this.s3Client.send(new PutObjectCommand(params));
      return data;
    } catch (err) {
      if (err.$metadata?.httpStatusCode === 503) {
        if (this.currentRetry < this.maxRetries) {
          const delay = Math.min(this.delay * Math.pow(2, this.currentRetry), this.maxDelay);
          this.currentRetry++;
          console.warn(`Received 503 error. Retrying after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.putObject(params);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
  }
}
