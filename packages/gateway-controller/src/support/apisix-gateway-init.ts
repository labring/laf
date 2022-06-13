/**
 * init base route
 */
import Config from "../config";
import axios, {AxiosRequestHeaders} from "axios";
import {logger} from "./logger";

const headers: AxiosRequestHeaders = {
    'X-API-KEY': Config.API_SIX_KEY,
    'Content-Type': 'application/json',
}

export function initBaseRoute(){
    initSystemClientRoute()
    initAppConsoleRoute()
    initSysApiRoute()
    initOssRoute()
}


function initSystemClientRoute() {
    let data = {
        name: 'system-client',
        uris: ['/'],
        hosts: [Config.SYS_CLIENT_HOST],
        upstream: {
            type: 'roundrobin',
            nodes: {'system-client:8080': 1}
        },
        timeout: {
            connect: 600,
            send: 600,
            read: 600,
        }
    }
    axios.put('http://gateway:9080/apisix/admin/routes/base_system_client', data, {
        headers: headers
    }).then(_ => {
        logger.info('create system-client route successful')
    }).catch(err => {
        logger.info('create system-client route failed: ', err)
    })
}

function initAppConsoleRoute() {
    let data = {
        name: 'app-console',
        uris: ['/app-console/*'],
        hosts: [Config.SYS_CLIENT_HOST],
        upstream: {
            type: 'roundrobin',
            nodes: {'app-console:8080': 1}
        },
        timeout: {
            connect: 600,
            send: 600,
            read: 600,
        },
        plugins: {
            'proxy-rewrite': {
                regex_uri: ["^/app-console/(.*)", "/$1"]
            }
        }
    }
    axios.put('http://gateway:9080/apisix/admin/routes/base_app_console', data, {
        headers: headers
    }).then(_ => {
        logger.info('create app-console route successful')
    }).catch(err => {
        logger.info('create app-console route failed: ', err)
    })
}

function initSysApiRoute() {
    let data = {
        name: 'sys-api',
        uris: ['/sys-api/*'],
        hosts: [Config.SYS_CLIENT_HOST],
        upstream: {
            type: 'roundrobin',
            nodes: {'system-server:9000': 1}
        },
        timeout: {
            connect: 600,
            send: 600,
            read: 600,
        },
        plugins: {
            'proxy-rewrite': {
                regex_uri: ["^/sys-api/(.*)", "/$1"]
            }
        }
    }
    axios.put('http://gateway:9080/apisix/admin/routes/base_sys_api', data, {
        headers: headers
    }).then(_ => {
        logger.info('create sys-api route successful')
    }).catch(err => {
        logger.info('create sys-api route failed: ', err)
    })
}


function initOssRoute(){
    let data = {
        name: 'oss',
        uris: ['/*'],
        hosts: [Config.DEPLOY_OSS_DOMAIN],
        upstream: {
            type: 'roundrobin',
            nodes: {'oss:9000': 1}
        },
        timeout: {
            connect: 600,
            send: 600,
            read: 600,
        }
    }
    axios.put('http://gateway:9080/apisix/admin/routes/base_oss', data, {
        headers: headers
    }).then(_ => {
        logger.info('create oss route successful')
    }).catch(err => {
        logger.info('create oss route failed: ', err)
    })
}