/**
 * gateway operator
 */
import {IRouteData} from "./route";
import {ApiSixGateway} from "./apisix-gateway";
import {logger} from "./logger";
import Config from "../config";

export class GatewayOperator {

  public static async create(route: IRouteData) {
    return await this.gateway().create(route)
  }

  public static async delete(route: IRouteData) {
    return await this.gateway().delete(route)
  }

  private static gateway(): GatewayInterface {
    const gatewayType = Config.GATEWAY_TYPE || 'apisix'
    if (gatewayType === 'apisix') {
      return new ApiSixGateway()
    } else {
      logger.error('')
    }
  }
}

export interface GatewayInterface {

  create(route: IRouteData): Promise<boolean>

  delete(route: IRouteData): Promise<boolean>

}