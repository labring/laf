import { request } from '../util/request'

export async function databaseControllerExport(appid: string): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/databases/export`,
    method: 'GET',
    responseType: 'stream',
  })
}

export async function databaseControllerImport(appid: string, data: any): Promise<any> {
  return request({
    url: `/v1/apps/${appid}/databases/import`,
    method: 'PUT',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
