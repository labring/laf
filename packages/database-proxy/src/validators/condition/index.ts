import * as vm from 'vm'
import { Handler } from '../../processor'
import { AccessorInterface } from '../../accessor'

interface QueryResultPair {
  query: [string, any],
  result: any
}

export const ConditionHandler: Handler = async function (config, context) {
  // 缺省验证时，给予通过
  if (config === undefined) {
    return null
  }

  try {
    const { injections, params, ruler } = context
    const global = { ...injections, ...params }

    const queries = getQueries(config, global)

    const prepared: QueryResultPair[] = []

    for (let query of queries) {
      const [target, value] = query
      const result = await doQuery(target, value, ruler.accessor)
      prepared.push({ query, result })
    }

    function GetFunc(target: string, value: any) {
      for (let el of prepared) {
        const [t, v] = el.query
        if (t === target && v === value)
          return el.result
      }
      return null
    }

    global.get = GetFunc
    const script = new vm.Script(config)
    const result = script.runInNewContext(global)
    if (result) return null

    return 'the expression evaluated to a falsy value'
  } catch (error) {
    return error
  }
}

async function doQuery(target: string, value: any, accessor: AccessorInterface): Promise<any> {
  // target like '/users/_id'
  const [, collection, field] = target.split('/')
  const query = {
    [field]: value
  }
  const result = await accessor.get(collection, query)
  return result
}

function getQueries(code: string, injections: any): [string, any][] {
  const wrapper = `
    let collection = []
    function get(...params){
        collection.push(params)
        return {}
    }
    ${code};
    (collection);
  `
  const script = new vm.Script(wrapper)
  const queries = script.runInNewContext(injections)
  return queries
}