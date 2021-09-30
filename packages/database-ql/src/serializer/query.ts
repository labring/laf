import {
  isQueryCommand,
  isComparisonCommand,
  QUERY_COMMANDS_LITERAL,
  QueryCommand
} from '../commands/query'
import {
  isLogicCommand,
  LOGIC_COMMANDS_LITERAL,
  LogicCommand
} from '../commands/logic'
import { SYMBOL_UNSET_FIELD_NAME } from '../helper/symbol'
import { getType, isObject, isArray, isRegExp } from '../utils/type'
import { operatorToString } from '../operator-map'
import {
  flattenQueryObject,
  isConversionRequired,
  encodeInternalDataType
} from './common'
import {
  IGeoNearOptions,
  IGeoWithinOptions,
  IGeoIntersectsOptions
} from '../commands/query'

export type IQueryCondition = Record<string, any> | LogicCommand

export class QuerySerializer {
  constructor() {}

  static encode(
    query: IQueryCondition | QueryCommand | LogicCommand
  ): IQueryCondition {
    const encoder = new QueryEncoder()
    return encoder.encodeQuery(query)
  }
}

class QueryEncoder {
  encodeQuery(
    query: IQueryCondition | QueryCommand | LogicCommand,
    key?: any
  ): IQueryCondition {
    if (isConversionRequired(query)) {
      if (isLogicCommand(query)) {
        return this.encodeLogicCommand(query)
      } else if (isQueryCommand(query)) {
        return this.encodeQueryCommand(query)
      } else {
        return { [key]: this.encodeQueryObject(query) }
      }
    } else {
      if (isObject(query)) {
        return this.encodeQueryObject(query)
      } else {
        // abnormal case, should not enter this block
        return query
      }
    }
  }

  encodeRegExp(query: RegExp) {
    return {
      $regex: query.source,
      $options: query.flags
    }
  }

  encodeLogicCommand(query: LogicCommand): IQueryCondition {
    switch (query.operator) {
      case LOGIC_COMMANDS_LITERAL.NOR:
      case LOGIC_COMMANDS_LITERAL.AND:
      case LOGIC_COMMANDS_LITERAL.OR: {
        const $op = operatorToString(query.operator)
        const subqueries = query.operands.map(oprand =>
          this.encodeQuery(oprand, query.fieldName)
        )
        return {
          [$op]: subqueries
        }
      }
      case LOGIC_COMMANDS_LITERAL.NOT: {
        const $op = operatorToString(query.operator)
        const operatorExpression: QueryCommand | RegExp = query.operands[0]

        if (isRegExp(operatorExpression)) {
          return {
            [query.fieldName as string]: {
              [$op]: this.encodeRegExp(operatorExpression)
            }
          }
        } else {
          const subqueries = this.encodeQuery(operatorExpression)[
            query.fieldName as string
          ]
          return {
            [query.fieldName as string]: {
              [$op]: subqueries
            }
          }
        }
      }
      default: {
        const $op = operatorToString(query.operator)
        if (query.operands.length === 1) {
          const subquery = this.encodeQuery(query.operands[0])
          return {
            [$op]: subquery
          }
        } else {
          const subqueries = query.operands.map(this.encodeQuery.bind(this))
          return {
            [$op]: subqueries
          }
        }
      }
    }
  }

  encodeQueryCommand(query: QueryCommand): IQueryCondition {
    if (isComparisonCommand(query)) {
      return this.encodeComparisonCommand(query)
    } else {
      // TODO: when more command types are added, change it here
      return this.encodeComparisonCommand(query)
    }
  }

  encodeComparisonCommand(query: QueryCommand): IQueryCondition {
    if (query.fieldName === SYMBOL_UNSET_FIELD_NAME) {
      throw new Error(
        'Cannot encode a comparison command with unset field name'
      )
    }

    const $op = operatorToString(query.operator)

    switch (query.operator) {
      case QUERY_COMMANDS_LITERAL.EQ:
      case QUERY_COMMANDS_LITERAL.NEQ:
      case QUERY_COMMANDS_LITERAL.LT:
      case QUERY_COMMANDS_LITERAL.LTE:
      case QUERY_COMMANDS_LITERAL.GT:
      case QUERY_COMMANDS_LITERAL.GTE:
      case QUERY_COMMANDS_LITERAL.ELEM_MATCH:
      case QUERY_COMMANDS_LITERAL.EXISTS:
      case QUERY_COMMANDS_LITERAL.SIZE:
      case QUERY_COMMANDS_LITERAL.MOD: {
        return {
          [query.fieldName as string]: {
            [$op]: encodeInternalDataType(query.operands[0])
          }
        }
      }
      case QUERY_COMMANDS_LITERAL.IN:
      case QUERY_COMMANDS_LITERAL.NIN:
      case QUERY_COMMANDS_LITERAL.ALL: {
        return {
          [query.fieldName as string]: {
            [$op]: encodeInternalDataType(query.operands)
          }
        }
      }
      case QUERY_COMMANDS_LITERAL.GEO_NEAR: {
        const options: IGeoNearOptions = query.operands[0]
        return {
          [query.fieldName as string]: {
            $nearSphere: {
              $geometry: options.geometry.toJSON(),
              $maxDistance: options.maxDistance,
              $minDistance: options.minDistance
            }
          }
        }
      }
      case QUERY_COMMANDS_LITERAL.GEO_WITHIN: {
        const options: IGeoWithinOptions = query.operands[0]
        return {
          [query.fieldName as string]: {
            $geoWithin: {
              $geometry: options.geometry.toJSON()
            }
          }
        }
      }
      case QUERY_COMMANDS_LITERAL.GEO_INTERSECTS: {
        const options: IGeoIntersectsOptions = query.operands[0]
        return {
          [query.fieldName as string]: {
            $geoIntersects: {
              $geometry: options.geometry.toJSON()
            }
          }
        }
      }
      default: {
        return {
          [query.fieldName as string]: {
            [$op]: encodeInternalDataType(query.operands[0])
          }
        }
      }
    }
  }

  encodeQueryObject(query: IQueryCondition): IQueryCondition {
    const flattened = flattenQueryObject(query)
    for (const key in flattened) {
      const val = flattened[key]
      if (isLogicCommand(val)) {
        flattened[key] = val._setFieldName(key)
        const condition = this.encodeLogicCommand(flattened[key])
        this.mergeConditionAfterEncode(flattened, condition, key)
      } else if (isComparisonCommand(val)) {
        flattened[key] = val._setFieldName(key)
        const condition = this.encodeComparisonCommand(flattened[key])
        this.mergeConditionAfterEncode(flattened, condition, key)
      } else if (isConversionRequired(val)) {
        flattened[key] = encodeInternalDataType(val)
      }
    }
    return flattened
  }

  /**
   * @description Merge 2 query conditions
   * @example
   *
   * Normal cases:
   *
   * C1. merge top-level commands, such as $and and $or:
   * let A = { $and: [{a: 1}] }
   * let B = { $and: [{b: 2}] }
   * merge(A, B) == { $and: [{a: 1}, {b: 2}] }
   *
   * C2. merge top-level fields
   * let A = { a: { $gt: 1 } }
   * let B = { a: { $lt: 5 } }
   * merge(A, B) == { a: { $gt: 1, $lt: 5 } }
   *
   * Edge cases:
   *
   * E1. unmergable top-level fields
   * Solution: override
   * let A = { a: 1 }
   * let B = { a: { $gt: 1 } }
   * merge(A, B) == B
   *
   * @param query
   * @param condition
   * @param key
   */
  mergeConditionAfterEncode(
    query: Record<string, any>,
    condition: Record<string, any>,
    key: string
  ): void {
    if (!condition[key]) {
      delete query[key]
    }

    for (const conditionKey in condition) {
      if (query[conditionKey]) {
        if (isArray(query[conditionKey])) {
          // bug
          query[conditionKey] = query[conditionKey].concat(
            condition[conditionKey]
          )
        } else if (isObject(query[conditionKey])) {
          if (isObject(condition[conditionKey])) {
            Object.assign(query, condition)
          } else {
            console.warn(
              `unmergable condition, query is object but condition is ${getType(
                condition
              )}, can only overwrite`,
              condition,
              key
            )
            query[conditionKey] = condition[conditionKey]
          }
        } else {
          console.warn(
            `to-merge query is of type ${getType(query)}, can only overwrite`,
            query,
            condition,
            key
          )
          query[conditionKey] = condition[conditionKey]
        }
      } else {
        query[conditionKey] = condition[conditionKey]
      }
    }
  }
}

/**

{
  prop: {
    mem: _.gt(4).and(_.lt(8)),
  },
  price: _.lt(5000).and(_.gt(3000))
}

=>

{
  prop: {
    mem: $and([
      $gt(4),
      $lt(8),
    ])
  },
  price: $and([
    $lt(5000),
    $gt(3000),
  ])
}

=>

{
  $and: [
    {
      'prop.mem': {
        $gt: 4,
        $lt: 8
      }
    },
    {
      'price': {
        $gt: 3000,
        $lt: 5000
      }
    }
  ]
}

 */

/**

_.or([
  {
    category: 'pc'
    prop: {
      mem: _.gt(8).and(_.lt(16)).or(_.eq(32))
    },
  },
  {
    category: 'pc'
    prop: {
      cpu: _.gt(3.2)
    }
  }
])

=>

_.or([
  {
    category: 'pc',
    prop: {
      mem: $or([
        $and([
          $gt(8),
          $lt(16),
        ]),
        $eq(32)
      ])
    }
  },
  {
    category: 'pc',
    prop: {
      cpu: $gt(3.2)
    }
  }
])

=>

{
  $or: [
    {
      //...
    },
    {
      //...
    }
  ]
}

=>

{
  $or: [
    {
      category: 'pc',
      $or: [
        $and: [
          'prop.mem': {
            $gt: 8,
            $lt: 16,
          },
        ],
        'prop.mem': {
          $eq: 32
        }
      ]
    },
    {
      category: 'pc',
      'prop.cpu': {
        $eq: 3.2
      }
    }
  ]
}

 */
