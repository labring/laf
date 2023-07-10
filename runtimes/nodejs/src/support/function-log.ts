import axios from 'axios'
import Config from '../config'
import { FunctionConsole, FunctionContext } from './function-engine'

export interface IFunctionLog {
  request_id: string
  func: string
  data: string
  created_at: Date
}

FunctionConsole.write = (message: string, ctx: FunctionContext) => {
  if (!Config.LOG_SERVER_URL) return

  const doc = {
    request_id: ctx.requestId,
    func: ctx.__function_name,
    data: message,
    created_at: new Date(),
  }

  axios.post(`${Config.LOG_SERVER_URL}/function/log`, {
    appid: Config.APPID,
    log: doc,
  })
}
