import {GatewayInterface} from "./gateway-operator";
import {IRouteData, RouteType} from "./route";
import Config from "../config";
import {ApiSixHttpUtils} from "./apisix-gateway-utils";

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
        }
    }

    public async delete(route: IRouteData) {
        if (route.type === RouteType.APP) {
            return await deleteAppRoute(this.baseUrl, route)
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
        }
    }
    return await ApiSixHttpUtils.put(url, route.appid, data)
}

async function deleteAppRoute(url: string, route: IRouteData) {
    return await ApiSixHttpUtils.delete(url, route.appid)
}