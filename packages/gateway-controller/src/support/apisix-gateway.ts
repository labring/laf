import {GatewayInterface} from "./gateway-operator";
import {IRouteData, RouteType} from "./route";
import Config from "../config";
import {ApiSixHttpUtils} from "./apisix-gateway-utils";
import {logger} from "./logger";

export class ApiSixGateway implements GatewayInterface {

  baseUrl: string


  constructor() {
    if (Config.SERVICE_DRIVER == 'docker') {
      this.baseUrl = 'http://gateway:9080'
    }
  }

  public async create(route: IRouteData) {
    if (route.type === RouteType.APP) {
      return await createAppRoute(this.baseUrl, route)
    } else if (route.type === RouteType.WEBSITE) {
      return await createWebsiteRoute(this.baseUrl, route)
    }
  }

  public async delete(route: IRouteData) {
    if (route.type === RouteType.APP) {
      return await deleteAppRoute(this.baseUrl, route)
    } else if (route.type === RouteType.WEBSITE) {
      return await deleteWebsiteRoute(this.baseUrl, route)
    }
  }

}

async function createAppRoute(url: string, route: IRouteData) {

  let host = null, node = null
  if (Config.SERVICE_DRIVER == 'docker') {
    host = route.appid + '.' + Config.DEPLOY_DOMAIN
    node = 'app-' + route.appid + ':8000'
  }

  let data = {
    name: route.name,
    uri: '/*',
    hosts: [host],
    priority: 9, // 设置优先级较高点
    upstream: {
      type: 'roundrobin',
      nodes: {
        [node]: 1
      }
    },
    timeout: {
      connect: 600,
      send: 600,
      read: 600,
    },
    plugins: {
      cors: {}
    },
    enable_websocket: true
  }
  return await ApiSixHttpUtils.put(url, route.appid, data)
}

async function deleteAppRoute(url: string, route: IRouteData) {
  return await ApiSixHttpUtils.delete(url, route.appid)
}


async function createWebsiteRoute(url: string, route: IRouteData) {
  if (route.domain.length <= 0) {
    logger.warn('website: {} domain list is empty')
    return false
  }
  let host = null, node = null
  if (Config.SERVICE_DRIVER == 'docker') {
    host = route.domain[0]
    node = 'oss:9000'
  }

  let upstream_host = null
  if (route.domain.length > 1) {
    upstream_host = route.domain[1]
  } else {
    upstream_host = route.domain[0]

  }

  let data = {
    name: route.name,
    uri: '/*',
    hosts: [host],
    priority: 9, // 设置优先级较高点
    upstream: {
      pass_host: 'rewrite',
      upstream_host: upstream_host,
      type: 'roundrobin',
      nodes: {
        [node]: 1
      }
    },
    timeout: {
      connect: 600,
      send: 600,
      read: 600,
    },
    plugins: {
      'proxy-rewrite': {
        regex_uri: ["/$", "/index.html"]
      }
    }
  }
  return await ApiSixHttpUtils.put(url, route.website_id, data)
}

async function deleteWebsiteRoute(url: string, route: IRouteData) {
  return await ApiSixHttpUtils.delete(url, route.website_id)
}