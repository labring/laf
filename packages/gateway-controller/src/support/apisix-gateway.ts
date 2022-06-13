import {GatewayInterface} from "./gateway-operator";
import {IRouteData} from "./route";
import {AxiosRequestHeaders} from "axios";
import axios from "axios";
import {logger} from "./logger";
import Config from "../config";

export class ApiSixGateway implements GatewayInterface {

    baseUrl: string


    constructor() {
        if (Config.SERVICE_DRIVER == 'docker') {
            this.baseUrl = 'http://gateway:9080'
        }
    }

    public async create(route: IRouteData) {
        let hosts = [route.appid + '.' + Config.DEPLOY_DOMAIN]
        let nodes
        if (Config.SERVICE_DRIVER == 'docker') {
            let node = 'app-' + route.appid + ':8000'
            nodes = {
                [node]: 1
            }
        }
        return ApiSixOperator.putRoute(this.baseUrl, route.appid, route.name, hosts, nodes)
    }

    public async delete(route: IRouteData) {
        return ApiSixOperator.deleteRoute(this.baseUrl, route.appid)
    }

}


class ApiSixOperator {

    static headers: AxiosRequestHeaders = {
        'X-API-KEY': Config.API_SIX_KEY,
        'Content-Type': 'application/json',
    }

    static async putRoute(baseUrl: string, appid: string, name: string, hosts: string[], nodes: Record<string, number>) {
        let data = {
            name: name,
            uri: '/',
            hosts: hosts,
            priority: 9, // 设置优先级较高点
            upstream: {
                type: 'roundrobin',
                nodes: nodes
            },
            timeout: {
                connect: 600,
                send: 600,
                read: 600,
            }
        }
        let resStatus = false
        await axios.put(baseUrl + '/apisix/admin/routes/' + appid, data, {
            headers: this.headers,
        })
            .then(_ => {
                logger.info('create route successful')
                resStatus = true
            })
            .catch(err => {
                logger.info('create route failed: ', err)
            })
        return resStatus
    }

    static async deleteRoute(baseUrl: string, appid: string) {
        let resStatus = false
        await axios.delete(baseUrl + '/apisix/admin/routes/' + appid, {
            headers: this.headers,
        })
            .then(_ => {
                logger.info('delete route successful')
                resStatus = true
            })
            .catch(err => {
                logger.info('delete route failed: ', err)
            })
        return resStatus
    }
}
