import axios, {AxiosRequestHeaders} from "axios";
import Config from "../config";
import {logger} from "./logger";

export class ApiSixHttpUtils {

    static headers: AxiosRequestHeaders = {
        'X-API-KEY': Config.API_SIX_KEY,
        'Content-Type': 'application/json',
    }

    static async put(url: string, appid: string, data: Object) {
        let resStatus = false
        await axios.put(url + '/apisix/admin/routes/' + appid, data, {
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

    static async delete(url: string, appid: string) {
        let resStatus = false
        await axios.delete(url + '/apisix/admin/routes/' + appid, {
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

    static async putSSL(url: string, id: string, sns: string, cert: string, key: string) {
        let resStatus = false
        let data = {
            cert: cert,
            key: key,
            snis: [sns],
            labels: {'update_time': new Date().getTime() + ''}
        }
        await axios.put(url + '/apisix/admin/ssl/' + id, data, {
            headers: this.headers,
        })
            .then(_ => {
                logger.info('create ssl successful')
                resStatus = true
            })
            .catch(err => {
                logger.info('create sll failed: ', err)
            })
        return resStatus
    }

    static async deleteSSL(url: string, id: string) {
        let resStatus = false
        await axios.delete(url + '/apisix/admin/ssl/' + id, {
            headers: this.headers,
        })
            .then(_ => {
                logger.info('delete ssl successful')
                resStatus = true
            })
            .catch(err => {
                logger.info('delete ssl failed: ', err)
            })
        return resStatus
    }

}