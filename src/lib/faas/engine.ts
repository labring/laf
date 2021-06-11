/**
 * @deprecated 老版本的云函数引擎，后面逐渐会被弃用
 */

import * as vm from 'vm'
import { nanosecond2ms } from '../utils/time'
import { FunctionConsole } from './console'
import { FunctionResult, IncomingContext, RequireFuncType, RuntimeContext } from './types'

const require_func: RequireFuncType = (module): any => {
  const supported = ['crypto', 'path', 'querystring', 'url', 'lodash', 'moment']
  if (supported.includes(module)) { return require(module) as any }
  return undefined
}

export class FunctionEngine {

  async run(code: string, incomingCtx: IncomingContext): Promise<FunctionResult> {

    const requestId = incomingCtx.requestId
    const fconsole = new FunctionConsole()
    const wrapped = `${code}; __runtime_promise = exports.main(ctx)`

    const _module = {
      exports: {}
    }
    const sandbox: RuntimeContext = {
      ctx: {
        query: incomingCtx.query,
        body: incomingCtx.body,
        method: incomingCtx.method,
        params: incomingCtx.params,
        auth: incomingCtx.auth,
        requestId: requestId,
      },
      module: _module,
      exports: module.exports,
      __runtime_promise: null,
      console: fconsole,
      less: incomingCtx.less,
      require: require_func,
      Buffer: Buffer
    }

    // 调用前计时
    const _start_time = process.hrtime.bigint()
    try {
      const script = new vm.Script(wrapped)
      script.runInNewContext(sandbox)
      const data = await sandbox.__runtime_promise
      // 函数执行耗时
      const _end_time = process.hrtime.bigint()
      const time_usage = nanosecond2ms(_end_time - _start_time)
      return {
        data,
        logs: fconsole.logs,
        time_usage
      }
    } catch (error) {
      fconsole.log(error.message)
      fconsole.log(error.stack)
      // 函数执行耗时
      const _end_time = process.hrtime.bigint()
      const time_usage = nanosecond2ms(_end_time - _start_time)
      return {
        error: error,
        logs: fconsole.logs,
        time_usage
      }
    }
  }
}