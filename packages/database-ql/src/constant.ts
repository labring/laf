/**
 * 常量模块
 *
 * @author haroldhu
 */

/**
 * 错误码
 */
enum ErrorCode {
  DocIDError = '文档ID不合法',
  CollNameError = '集合名称不合法',
  OpStrError = '操作符不合法',
  DirectionError = '排序字符不合法',
  IntegerError = 'must be integer',
  QueryParamTypeError = '查询参数必须为对象',
  QueryParamValueError = '查询参数对象值不能均为undefined'
}

/**
 * 字段类型
 */
const FieldType = {
  String: 'String',
  Number: 'Number',
  Object: 'Object',
  Array: 'Array',
  Boolean: 'Boolean',
  Null: 'Null',
  GeoPoint: 'GeoPoint',
  GeoLineString: 'GeoLineString',
  GeoPolygon: 'GeoPolygon',
  GeoMultiPoint: 'GeoMultiPoint',
  GeoMultiLineString: 'GeoMultiLineString',
  GeoMultiPolygon: 'GeoMultiPolygon',
  Timestamp: 'Date',
  Command: 'Command',
  ServerDate: 'ServerDate',
  BsonDate: 'BsonDate',
  ObjectId: 'ObjectId',
  Binary: 'Binary'
}

/**
 * 排序方向
 */
type OrderByDirection = 'desc' | 'asc'

/**
 * 排序方向列表
 */
const OrderDirectionList = ['desc', 'asc']

/**
 * 查询条件操作符
 */
type WhereFilterOp = '<' | '<=' | '==' | '>=' | '>'

/**
 * 操作符列表
 */
const WhereFilterOpList = ['<', '<=', '==', '>=', '>']

/**
 * 操作符别名
 */
enum Operator {
  lt = '<',
  gt = '>',
  lte = '<=',
  gte = '>=',
  eq = '=='
}

/**
 * 操作符映射
 * SDK => MongoDB
 */
const OperatorMap = {
  [Operator.eq]: '$eq',
  [Operator.lt]: '$lt',
  [Operator.lte]: '$lte',
  [Operator.gt]: '$gt',
  [Operator.gte]: '$gte'
}

const UpdateOperatorList = [
  '$set',
  '$inc',
  '$mul',
  '$unset',
  '$push',
  '$pop',
  '$unshift',
  '$shift',
  '$currentDate',
  '$each',
  '$position'
]

enum ActionType {
  add = 'database.addDocument',
  query = 'database.queryDocument',
  update = 'database.updateDocument',
  count = 'database.countDocument',
  remove = 'database.deleteDocument',
  aggregate = 'database.aggregateDocuments'
}

export {
  ErrorCode,
  FieldType,
  WhereFilterOp,
  WhereFilterOpList,
  Operator,
  OperatorMap,
  OrderByDirection,
  OrderDirectionList,
  UpdateOperatorList,
  ActionType
}
