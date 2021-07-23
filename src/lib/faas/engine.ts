/**
 * @deprecated 老版本的云函数引擎，后面逐渐会被弃用
 */

 import * as vm from 'vm'
 import { nanosecond2ms } from '../utils/time'
 import { FunctionConsole } from './console'
 import { FunctionResult, IncomingContext, RequireFuncType, RuntimeContext } from './types'
 
 const require_func: RequireFuncType = (module): any => {
   return require(module) as any
 }
 
 export class FunctionEngine {
 
   async run(code: string, incomingCtx: IncomingContext): Promise<FunctionResult> {
 
     const fconsole = new FunctionConsole()
     const wrapped = `
      ${code}; 
      const __main__ = exports.main || exports.default
      if(!__main__) { throw new Error('FunctionExecError: main function not found') }
      if(typeof __main__ !== 'function') { throw new Error('FunctionExecError: main function must be callable')}
      __runtime_promise = __main__(__context__ )
      `
 
     const _module = {
       exports: {}
     }
     const sandbox: RuntimeContext = {
       __context__: incomingCtx.context,
       module: _module,
       exports: _module.exports,
       __runtime_promise: null,
       console: fconsole,
       less: incomingCtx.less,
       cloud: incomingCtx.cloud,
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