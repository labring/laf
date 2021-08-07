import request from '@/utils/request'
import axios from 'axios'
/**
 * 创建部署令牌
 * @param {string[]} permissions 令牌权限: "policy" , "function"
 * @param {number} expire 过期时间，单位是小时
 * @param {string} source 标识部署来源名称
 * @returns
 */
export function createDeployToken({ permissions, expire, source }) {
  return request({
    url: '/deploy/create-token',
    method: 'post',
    data: {
      permissions,
      expire,
      source
    }
  })
}

/**
 * 部署访问策略
 */
export async function deploy2remote(deploy_url, deploy_token, { policies, functions, comment }) {
  const _data = {
    deploy_token,
    policies: policies,
    functions: functions,
    comment
  }
  const res = await axios.post(deploy_url, _data)
  return res.data
}

/**
 * 应用部署请求
 * @param {string} id  部署请求的 id
 * @returns
 */
export function applyDeployRequest(id) {
  return request({
    url: '/deploy/apply',
    method: 'post',
    data: {
      id
    }
  })
}
