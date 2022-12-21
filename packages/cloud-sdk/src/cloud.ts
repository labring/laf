import { Db } from "database-proxy";
import request, { AxiosStatic } from "axios";
import {
  CloudSdkInterface,
  GetTokenFunctionType,
  InvokeFunctionType,
  MongoDriverObject,
  ParseTokenFunctionType,
} from "./cloud.interface";
import { WebSocket } from "ws";

export default class Cloud implements CloudSdkInterface {
  /**
   * This method should be overwrite
   * @returns
   */
  static create: () => CloudSdkInterface;

  private _cloud: CloudSdkInterface;

  private get cloud(): CloudSdkInterface {
    if (!this._cloud) {
      this._cloud = Cloud.create();
    }
    return this._cloud;
  }

  fetch: AxiosStatic = request;

  database(): Db {
    return this.cloud.database();
  }

  invoke: InvokeFunctionType = (name: string, param: any) => {
    return this.cloud.invoke(name, param);
  };

  getToken: GetTokenFunctionType = (param: any) => {
    return this.cloud.getToken(param);
  };

  parseToken: ParseTokenFunctionType = (token: string) => {
    return this.cloud.parseToken(token);
  };

  get shared(): Map<string, any> {
    return this.cloud.shared;
  }

  get mongo(): MongoDriverObject {
    return this.cloud.mongo;
  }

  get sockets(): Set<WebSocket> {
    return this.cloud.sockets;
  }

  get appid(): string {
    return this.cloud.appid;
  }

  get env() {
    return this.cloud.env;
  }
}
