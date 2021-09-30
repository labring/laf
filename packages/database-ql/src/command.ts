import { IGeoIntersectsOptions, IGeoNearOptions, IGeoWithinOptions, QueryCommand, QUERY_COMMANDS_LITERAL } from './commands/query'
import { LogicCommand, LOGIC_COMMANDS_LITERAL } from './commands/logic'
import { UpdateCommand, UPDATE_COMMANDS_LITERAL } from './commands/update'
import { isArray, isObject, isString } from './utils/type'
import Aggregation from './aggregate'



export type IQueryCondition = Record<string, any> | LogicCommand

export const Command = {

  eq(val: any) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.EQ, [val])
  },

  neq(val: any) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.NEQ, [val])
  },

  lt(val: any) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.LT, [val])
  },

  lte(val: any) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.LTE, [val])
  },

  gt(val: any) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.GT, [val])
  },

  gte(val: any) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.GTE, [val])
  },

  in(val: any[]) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.IN, val)
  },

  nin(val: any[]) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.NIN, val)
  },

  all(val: any) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.ALL, val)
  },

  elemMatch(val: any) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.ELEM_MATCH, [val])
  },

  exists(val: boolean) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.EXISTS, [val])
  },

  size(val: number) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.SIZE, [val])
  },

  mod(val: number[]) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.MOD, [val])
  },

  geoNear(val: IGeoNearOptions) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.GEO_NEAR, [val])
  },

  geoWithin(val: IGeoWithinOptions) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.GEO_WITHIN, [val])
  },

  geoIntersects(val: IGeoIntersectsOptions) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.GEO_INTERSECTS, [val])
  },

  like(val: string) {
    return new QueryCommand(QUERY_COMMANDS_LITERAL.LIKE, [val])
  },

  and(...__expressions__: IQueryCondition[]) {
    const expressions = isArray(arguments[0]) ? arguments[0] : Array.from(arguments)
    return new LogicCommand(LOGIC_COMMANDS_LITERAL.AND, expressions)
  },

  nor(...__expressions__: IQueryCondition[]) {
    const expressions = isArray(arguments[0]) ? arguments[0] : Array.from(arguments)
    return new LogicCommand(LOGIC_COMMANDS_LITERAL.NOR, expressions)
  },

  or(...__expressions__: IQueryCondition[]) {
    const expressions = isArray(arguments[0]) ? arguments[0] : Array.from(arguments)
    return new LogicCommand(LOGIC_COMMANDS_LITERAL.OR, expressions)
  },

  not(...__expressions__: IQueryCondition[]) {
    const expressions = isArray(arguments[0]) ? arguments[0] : Array.from(arguments)
    return new LogicCommand(LOGIC_COMMANDS_LITERAL.NOT, expressions)
  },

  set(val: any) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.SET, [val])
  },

  remove() {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.REMOVE, [])
  },

  inc(val: number) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.INC, [val])
  },

  mul(val: number) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.MUL, [val])
  },

  push(...args: any[]) {
    let values
    if (isObject(args[0]) && args[0].hasOwnProperty('each')) {
      const options: any = args[0]
      values = {
        $each: options.each,
        $position: options.position,
        $sort: options.sort,
        $slice: options.slice
      }
    } else if (isArray(args[0])) {
      values = args[0]
    } else {
      values = Array.from(args)
    }

    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.PUSH, values)
  },

  pull(values) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.PULL, values)
  },

  pullAll(values) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.PULL_ALL, values)
  },

  pop() {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.POP, [])
  },

  shift() {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.SHIFT, [])
  },

  unshift(...__values__: any[]) {
    const values = isArray(arguments[0]) ? arguments[0] : Array.from(arguments)
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.UNSHIFT, values)
  },

  addToSet(values) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.ADD_TO_SET, values)
  },

  rename(values) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.RENAME, [values])
  },

  bit(values) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.BIT, [values])
  },

  max(values) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.MAX, [values])
  },

  min(values) {
    return new UpdateCommand(UPDATE_COMMANDS_LITERAL.MIN, [values])
  },

  expr(values: AggregationOperator) {
    return {
      $expr: values
    }
  },

  jsonSchema(schema) {
    return {
      $jsonSchema: schema
    }
  },

  text(values: string | {
    search: string
    language?: string
    caseSensitive?: boolean
    diacriticSensitive: boolean
  }) {
    if (isString(values)) {
      return {
        $search: values.search
      }
    } else {
      return {
        $search: values.search,
        $language: values.language,
        $caseSensitive: values.caseSensitive,
        $diacriticSensitive: values.diacriticSensitive
      }
    }
  },

  aggregate: {
    pipeline() {
      return new Aggregation()
    },

    // https://docs.mongodb.com/manual/reference/operator/aggregation/
    // 算数操作符（15个）
    abs: (param) => new AggregationOperator('abs', param),
    add: (param) => new AggregationOperator('add', param),
    ceil: (param) => new AggregationOperator('ceil', param),
    divide: (param) => new AggregationOperator('divide', param),
    exp: (param) => new AggregationOperator('exp', param),
    floor: (param) => new AggregationOperator('floor', param),
    ln: (param) => new AggregationOperator('ln', param),
    log: (param) => new AggregationOperator('log', param),
    log10: (param) => new AggregationOperator('log10', param),
    mod: (param) => new AggregationOperator('mod', param),
    multiply: (param) => new AggregationOperator('multiply', param),
    pow: (param) => new AggregationOperator('pow', param),
    sqrt: (param) => new AggregationOperator('sqrt', param),
    subtract: (param) => new AggregationOperator('subtract', param),
    trunc: (param) => new AggregationOperator('trunc', param),

    // 数组操作符（15个）
    arrayElemAt: (param) => new AggregationOperator('arrayElemAt', param),
    arrayToObject: (param) => new AggregationOperator('arrayToObject', param),
    concatArrays: (param) => new AggregationOperator('concatArrays', param),
    filter: (param) => new AggregationOperator('filter', param),
    in: (param) => new AggregationOperator('in', param),
    indexOfArray: (param) => new AggregationOperator('indexOfArray', param),
    isArray: (param) => new AggregationOperator('isArray', param),
    map: (param) => new AggregationOperator('map', param),
    range: (param) => new AggregationOperator('range', param),
    reduce: (param) => new AggregationOperator('reduce', param),
    reverseArray: (param) => new AggregationOperator('reverseArray', param),
    size: (param) => new AggregationOperator('size', param),
    slice: (param) => new AggregationOperator('slice', param),
    zip: (param) => new AggregationOperator('zip', param),

    //布尔操作符（3个）
    and: (param) => new AggregationOperator('and', param),
    not: (param) => new AggregationOperator('not', param),
    or: (param) => new AggregationOperator('or', param),

    // 比较操作符（7个）
    cmp: (param) => new AggregationOperator('cmp', param),
    eq: (param) => new AggregationOperator('eq', param),
    gt: (param) => new AggregationOperator('gt', param),
    gte: (param) => new AggregationOperator('gte', param),
    lt: (param) => new AggregationOperator('lt', param),
    lte: (param) => new AggregationOperator('lte', param),
    neq: (param) => new AggregationOperator('ne', param),

    // 条件操作符（3个）
    cond: (param) => new AggregationOperator('cond', param),
    ifNull: (param) => new AggregationOperator('ifNull', param),
    switch: (param) => new AggregationOperator('switch', param),

    // 日期操作符（15个）
    dateFromParts: (param) => new AggregationOperator('dateFromParts', param),
    dateFromString: (param) => new AggregationOperator('dateFromString', param),
    dayOfMonth: (param) => new AggregationOperator('dayOfMonth', param),
    dayOfWeek: (param) => new AggregationOperator('dayOfWeek', param),
    dayOfYear: (param) => new AggregationOperator('dayOfYear', param),
    isoDayOfWeek: (param) => new AggregationOperator('isoDayOfWeek', param),
    isoWeek: (param) => new AggregationOperator('isoWeek', param),
    isoWeekYear: (param) => new AggregationOperator('isoWeekYear', param),
    millisecond: (param) => new AggregationOperator('millisecond', param),
    minute: (param) => new AggregationOperator('minute', param),
    month: (param) => new AggregationOperator('month', param),
    second: (param) => new AggregationOperator('second', param),
    hour: (param) => new AggregationOperator('hour', param),
    // 'toDate', 4.0才有
    week: (param) => new AggregationOperator('week', param),
    year: (param) => new AggregationOperator('year', param),

    // 字面操作符
    literal: (param) => new AggregationOperator('literal', param),

    // 对象操作符
    mergeObjects: (param) => new AggregationOperator('mergeObjects', param),
    objectToArray: (param) => new AggregationOperator('objectToArray', param),

    // 集合操作符（7个）
    allElementsTrue: (param) => new AggregationOperator('allElementsTrue', param),
    anyElementTrue: (param) => new AggregationOperator('anyElementTrue', param),
    setDifference: (param) => new AggregationOperator('setDifference', param),
    setEquals: (param) => new AggregationOperator('setEquals', param),
    setIntersection: (param) => new AggregationOperator('setIntersection', param),
    setIsSubset: (param) => new AggregationOperator('setIsSubset', param),
    setUnion: (param) => new AggregationOperator('setUnion', param),

    // 字符串操作符（13个）
    concat: (param) => new AggregationOperator('concat', param),
    dateToString: (param) => new AggregationOperator('dateToString', param),
    indexOfBytes: (param) => new AggregationOperator('indexOfBytes', param),
    indexOfCP: (param) => new AggregationOperator('indexOfCP', param),
    // 'ltrim',
    // 'rtrim',
    split: (param) => new AggregationOperator('split', param),
    strLenBytes: (param) => new AggregationOperator('strLenBytes', param),
    strLenCP: (param) => new AggregationOperator('strLenCP', param),
    strcasecmp: (param) => new AggregationOperator('strcasecmp', param),
    substr: (param) => new AggregationOperator('substr', param),
    substrBytes: (param) => new AggregationOperator('substrBytes', param),
    substrCP: (param) => new AggregationOperator('substrCP', param),
    toLower: (param) => new AggregationOperator('toLower', param),
    // 'toString'
    // 'trim'
    toUpper: (param) => new AggregationOperator('toUpper', param),

    // 文本操作符
    meta: (param) => new AggregationOperator('meta', param),

    // group操作符（10个）
    addToSet: (param) => new AggregationOperator('addToSet', param),
    avg: (param) => new AggregationOperator('avg', param),
    first: (param) => new AggregationOperator('first', param),
    last: (param) => new AggregationOperator('last', param),
    max: (param) => new AggregationOperator('max', param),
    min: (param) => new AggregationOperator('min', param),
    push: (param) => new AggregationOperator('push', param),
    stdDevPop: (param) => new AggregationOperator('stdDevPop', param),
    stdDevSamp: (param) => new AggregationOperator('stdDevSamp', param),
    sum: (param) => new AggregationOperator('sum', param),

    // 变量声明操作符
    let: (param) => new AggregationOperator('let', param)
  },

  project: {
    slice: (param) => new ProjectionOperator('slice', param),
    elemMatch: (param) => new ProjectionOperator('elemMatch', param)
  }
}

class AggregationOperator {
  constructor(name, param) {
    this['$' + name] = param
  }
}

class ProjectionOperator {
  constructor(name, param) {
    this['$' + name] = param
  }
}

export default Command

