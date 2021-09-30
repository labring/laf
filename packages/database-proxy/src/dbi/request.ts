import { ActionType } from "../types"
import { DbConfig } from "."
import { Proxy } from "../proxy"

export class Request {

  private config: DbConfig

  constructor(config: DbConfig) {
    this.config = config
  }

  async send(action: ActionType, data: object) {

    const { accessor } = this.config

    const params = Proxy.parse(action, data)

    const ret = await accessor.execute(params)

    // 解决 mongodb _id 对象字符串问题
    const _data = JSON.parse(JSON.stringify(ret))

    return {
      code: 0,
      data: _data
    }
  }
}