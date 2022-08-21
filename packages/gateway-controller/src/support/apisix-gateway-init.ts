/**
 * init base route
 */
import Config from "../config"
import {ApiSixHttpUtils} from "./apisix-gateway-utils"
import {logger} from "./logger"

const fs = require('fs')

const baseUrl = 'http://gateway:9080'

export function initBaseRoute() {
  logger.info('start init base route')
  initSystemClientRoute()
  initAppConsoleRoute()
  initSysApiRoute()
  initOssRoute()
  initOssSubDomainRoute()
}

export async function initBaseSSL() {
  logger.info('start init base url')
  initGlobalSSL()

  // 每天查询一次ssl证书情况，判断是否需要更新
  setInterval(async () => {
    let ssl = await getGlobalSSL()
    if (ssl == null || ssl.validity_end < new Date().getTime() / 1000) {
      initGlobalSSL()
    }
  }, 1000 * 60 * 60 * 24)

}


function initSystemClientRoute() {
  let data = {
    name: 'system-client',
    uris: ['/*'],
    hosts: [Config.SYS_CLIENT_HOST],
    upstream: {
      type: 'roundrobin',
      nodes: {'system-client:8080': 1}
    },
    priority: 0,
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
    priority: 9,
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
    priority: 9,
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
    priority: 0,
    timeout: {
      connect: 600,
      send: 600,
      read: 600,
    }
  }
  ApiSixHttpUtils.put(baseUrl, 'base_oss_sub_domain', data)
}


function initGlobalSSL() {
  let crt = null
  let key = null
  try {
    crt = fs.readFileSync('/ssl/global.crt', 'utf8')
    key = fs.readFileSync('/ssl/global.key', 'utf8')
    logger.info('load cert successful')
  } catch (e) {
    logger.error('read global ssl cert fail: {}', e)
  }
  let ssl_domain = ['*.' + Config.DEPLOY_DOMAIN, '*.' + Config.DEPLOY_OSS_DOMAIN];
  ApiSixHttpUtils.putSSL(baseUrl, 'global_ssl', ssl_domain, crt, key)
}


async function getGlobalSSL() {
  return await ApiSixHttpUtils.getSSL(baseUrl, 'global_ssl')
}
