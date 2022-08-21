import axios, {AxiosRequestHeaders} from "axios";
import Config from "../config";
import {logger} from "./logger";

const {X509Certificate} = require('crypto');

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

  static async putSSL(url: string, id: string, snis: Array<string>, cert: string, key: string) {
    let resStatus = false

    // check ssl cert valid date
    const certInfo = new X509Certificate(cert)
    if (certInfo.code != undefined) {
      logger.error('parse cert fail: ', certInfo.reason)
      return
    }
    let data = {
      cert: cert,
      key: key,
      snis: snis,
      validity_end: new Date(certInfo.validTo).getTime() / 1000 - 3600 * 24 * 10,
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


  static async getSSL(url: string, id: string) {
    let ssl = null
    await axios.get(url + '/apisix/admin/ssl/' + id, {
      headers: this.headers,
    })
        .then(res => {
          if (res.status == 200) {
            ssl = res.data.node.value
          } else {
            logger.error('get ssl failed:  ', res.data)
          }
        })
        .catch(err => {
          logger.error('get ssl failed: ', err)
        })
    return ssl
  }
}