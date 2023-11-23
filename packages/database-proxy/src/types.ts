export enum ActionType {
  READ = 'database.queryDocument',
  UPDATE = 'database.updateDocument',
  ADD = 'database.addDocument',
  REMOVE = 'database.deleteDocument',
  COUNT = 'database.countDocument',
  WATCH = 'database.watchDocument',
  AGGREGATE = 'database.aggregateDocuments',
  CREATE_INDEX = 'database.createIndex',
  CREATE_INDEXES = 'database.createIndexes',
  DROP_INDEX = 'database.dropIndex',
  DROP_INDEXES = 'database.dropIndexes',
  LIST_INDEXES = 'database.listIndexes',
}

export interface Action {
  readonly type: ActionType
  readonly fields: string[]
}
//  params types
export enum Direction {
  DESC = 'desc',
  ASC = 'asc',
}

export interface Order {
  direction: Direction
  field: string
}

// left, right, inner, full
export enum JoinType {
  INNER = 'inner',
  LEFT = 'left',
  RIGHT = 'right',
  FULL = 'full',
}

export interface JoinParam {
  collection: string
  type: JoinType
  leftKey: string
  rightKey: string
}

export interface Params {
  collection: string
  action: ActionType
  query?: any
  data?: any

  order?: Order[]
  offset?: number
  limit?: number
  projection?: any
  count?: boolean

  multi?: boolean
  upsert?: boolean
  merge?: boolean

  stages?: { stageKey: string; stageValue: string }[]

  /**
   * nested table name, when use join, like [{ tableName: {id: 1, name: 'xxx'}, subTable: {id: 1, age: 1}}]
   * @deprecated this field is only used for mysql, and will be deprecated
   * @see https://github.com/mysqljs/mysql#joins-with-overlapping-column-names
   */
  nested?: boolean

  /**
   * SQL join
   * @deprecated this field is only used for mysql, and will be deprecated
   */
  joins?: JoinParam[]
}

const ReadAcceptParams = [
  'query',
  'order',
  'offset',
  'limit',
  'projection',
  'multi',
  'count',
  'joins',
  'nested',
]
const UpdateAcceptParams = [
  'query',
  'data',
  'multi',
  'upsert',
  'merge',
  'joins',
]
const AddAcceptParams = ['data', 'multi']
const RemoveAcceptParams = ['query', 'multi', 'joins']
const CountAcceptParams = ['query', 'joins']
const AggregateAcceptParams = ['stages']
const CreateIndexParams = ['data']
const DropIndexParams = ['data']
const DropIndexesParams = ['data']
const ListIndexesParams = ['data']

const ReadAction: Action = { type: ActionType.READ, fields: ReadAcceptParams }
const UpdateAction: Action = {
  type: ActionType.UPDATE,
  fields: UpdateAcceptParams,
}
const RemoveAction: Action = {
  type: ActionType.REMOVE,
  fields: RemoveAcceptParams,
}
const AddAction: Action = { type: ActionType.ADD, fields: AddAcceptParams }
const CountAction: Action = {
  type: ActionType.COUNT,
  fields: CountAcceptParams,
}
const WatchAction: Action = { type: ActionType.WATCH, fields: ReadAcceptParams }
const AggregateAction: Action = {
  type: ActionType.AGGREGATE,
  fields: AggregateAcceptParams,
}
const CreateIndexAction: Action = {
  type: ActionType.CREATE_INDEX,
  fields: CreateIndexParams,
}
const DropIndexAction: Action = {
  type: ActionType.DROP_INDEX,
  fields: DropIndexParams,
}
const DropIndexesAction: Action = {
  type: ActionType.DROP_INDEXES,
  fields: DropIndexesParams,
}
const ListIndexesAction: Action = {
  type: ActionType.LIST_INDEXES,
  fields: ListIndexesParams,
}

export function getAction(actionName: ActionType): Action | null {
  let action: Action
  switch (actionName) {
    case ActionType.READ:
      action = ReadAction
      break
    case ActionType.UPDATE:
      action = UpdateAction
      break
    case ActionType.ADD:
      action = AddAction
      break
    case ActionType.REMOVE:
      action = RemoveAction
      break
    case ActionType.COUNT:
      action = CountAction
      break
    case ActionType.WATCH:
      action = WatchAction
      break
    case ActionType.AGGREGATE:
      action = AggregateAction
      break
    case ActionType.CREATE_INDEX:
      action = CreateIndexAction
      break
    case ActionType.DROP_INDEX:
      action = DropIndexAction
      break
    case ActionType.DROP_INDEXES:
      action = DropIndexesAction
      break
    case ActionType.LIST_INDEXES:
      action = ListIndexesAction
      break
    default:
      action = null
  }
  return action
}

export const UPDATE_COMMANDS = {
  SET: '$set',
  REMOVE: '$unset',
  INC: '$inc',
  MUL: '$mul',
  PUSH: '$push',
  PULL: '$pull',
  PULL_ALL: '$pullAll',
  POP: '$pop',
  SHIFT: '$shift',
  UNSHIFT: '$unshift',
  BIT: '$bit',
  ADD_TO_SET: '$addToSet',
  RENAME: '$rename',
  MAX: '$max',
  MIN: '$min',
}

export const LOGIC_COMMANDS = {
  AND: '$and',
  OR: '$or',
  NOT: '$not',
  NOR: '$nor',
}

export const QUERY_COMMANDS = {
  EQ: '$eq',
  NEQ: '$ne',
  GT: '$gt',
  GTE: '$gte',
  LT: '$lt',
  LTE: '$lte',
  IN: '$in',
  NIN: '$nin',
  ALL: '$all',
  EXISTS: '$exists',
  SIZE: '$size',
  MOD: '$mod',
  ELE_MATCH: '$elemMatch',
  GEO_NEAR: '$geoNear',
  GEO_WITHIN: '$geoWithin',
  GEO_INTERSECTS: '$geoIntersects',
  LIKE: '$like', // only for SQL query
  EXPR: '$expr',
  TEXT: '$text',
  SEARCH: '$search',
}
