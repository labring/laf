/**
 * init base route
 */
import Config from "../config";
import {ApiSixHttpUtils} from "./apisix-gateway-utils";

const baseUrl = 'http://gateway:9080'

export function initBaseRoute() {
    initSystemClientRoute()
    initAppConsoleRoute()
    initSysApiRoute()
    initOssRoute()
    initOssSubDomainRoute()
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
    ApiSixHttpUtils.put(baseUrl, 'base_system_client', data)
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
    ApiSixHttpUtils.put(baseUrl, 'base_app_console', data)
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
    ApiSixHttpUtils.put(baseUrl, 'base_sys_api', data)
}


function initOssRoute() {
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
    ApiSixHttpUtils.put(baseUrl, 'base_oss', data)
}


function initOssSubDomainRoute() {
    let data = {
        name: 'oss-sub-domain',
        uris: ['/*'],
        hosts: ['*.' + Config.DEPLOY_OSS_DOMAIN],
        upstream: {
            type: 'roundrobin',
            nodes: {'oss:9000': 1}
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
    ApiSixHttpUtils.put(baseUrl, 'base_oss_sub_domain', data)
}