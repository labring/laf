import { request } from '../util/request'

export async function pat2token(server: string, data: { pat: string }): Promise<any> {
  return request({
    url: server + `/v1/pat2token`,
    method: 'POST',
    data: data,
  })
}
