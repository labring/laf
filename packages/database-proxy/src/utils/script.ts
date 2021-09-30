import * as vm from 'vm'
import { HandlerContext } from '..'
import { AccessorInterface } from '../accessor'


interface QueryResultPair {
  query: [string, any],
  result: any
}

/**
* 用于各场景下的 condition 表达式执行，支持 get() 函数
* @param code js code
* @param objects 要注入执行环境的对象
* @param context 请求上下文
* @param defaultField 当前上下文可指定的字段，用于 query 或 data 验证字段
* @returns 
*/
export async function executeScript(code: string, objects: any, context: HandlerContext, defaultField?: string): Promise<{ result?: any; error?: any }> {
  try {
    objects = objects ?? {}
    const { params, ruler } = context
    const global = { ...objects }

    /**
     * 获取代码里可能出现的 get() 函数
     * 因 get() 是异步的，无法直接执行，所以提前获取其调用位置和参数
     */
    const queries = getQueries(code, global)

    // 逐个调用代码中的 get() 函数，并保存其返回结果
    const prepared: QueryResultPair[] = []
    for (let query of queries) {
      const [value, target] = query
      let { collection, field } = parseQueryURI(target)
      // 缺省时查当前请求的集合
      if (!collection) collection = params.collection
      if (!field) field = defaultField ?? '_id'

      const result = await doGetQuery(collection, field, value, ruler.accessor)
      prepared.push({ query, result })
    }

    // 构造 get() 函数
    function GetFunc(target: string, value: any) {
      for (let el of prepared) {
        const [v, t] = el.query
        if (t === target && v === value)
          return el.result
      }
      return null
    }

    global.get = GetFunc
    const script = new vm.Script(code)
    const result = script.runInNewContext(global)
    return { result }
  } catch (error) {
    return { error }
  }
}

/**
* 解析查询路径
* @param target target like '/users/_id'  or `users/_id` or `_id` or undefined
* @param defaultCollection 
* @param defaultField 
* @returns 
*/
export function parseQueryURI(target: string): { collection?: string, field?: string } {
  if (!target) {
    return {}
  }

  const arr = target.split('/')
  if (arr.length === 1) {
    return { field: arr[0] }
  }

  if (arr.length === 2) {
    return { collection: arr[0], field: arr[1] }
  }

  if (arr.length === 3) {
    return { collection: arr[1], field: arr[2] }
  }
}

async function doGetQuery(collection: string, field: string, value: any, accessor: AccessorInterface): Promise<any> {
  const query = {
    [field]: value
  }
  const result = await accessor.get(collection, query)
  return result
}

function getQueries(code: string, injections: any): [string, any][] {
  const wrapper = `
    const __arr = []
    function get(...params){
        __arr.push(params)
        return {}
    }
    ${code};
    (__arr);
  `
  const script = new vm.Script(wrapper)
  const queries = script.runInNewContext(injections)
  return queries
}