import {
  UpdateCommand,
  isUpdateCommand,
  UPDATE_COMMANDS_LITERAL
} from '../commands/update'
import { LogicCommand } from '../commands/logic'
import { SYMBOL_UNSET_FIELD_NAME } from '../helper/symbol'
import { getType, isArray } from '../utils/type'
import { operatorToString } from '../operator-map'
import {
  flattenQueryObject,
  encodeInternalDataType,
  mergeConditionAfterEncode
} from './common'
export type IQueryCondition = Record<string, any> | LogicCommand

export interface IUpdateCondition {
  [key: string]: any
}

interface IPushModifiers {
  $each?: any[]
  $position?: number
}

export class UpdateSerializer {
  private constructor() {}

  static encode(query: IQueryCondition | UpdateCommand): IUpdateCondition {
    const stringifier = new UpdateSerializer()
    return stringifier.encodeUpdate(query)
  }

  encodeUpdate(query: IQueryCondition | UpdateCommand): IUpdateCondition {
    if (isUpdateCommand(query)) {
      return this.encodeUpdateCommand(query)
    } else if (getType(query) === 'object') {
      return this.encodeUpdateObject(query)
    } else {
      return query
    }
  }

  encodeUpdateCommand(query: UpdateCommand): IQueryCondition {
    if (query.fieldName === SYMBOL_UNSET_FIELD_NAME) {
      throw new Error(
        'Cannot encode a comparison command with unset field name'
      )
    }

    switch (query.operator) {
      case UPDATE_COMMANDS_LITERAL.PUSH:
      case UPDATE_COMMANDS_LITERAL.PULL:
      case UPDATE_COMMANDS_LITERAL.PULL_ALL:
      case UPDATE_COMMANDS_LITERAL.POP:
      case UPDATE_COMMANDS_LITERAL.SHIFT:
      case UPDATE_COMMANDS_LITERAL.UNSHIFT:
      case UPDATE_COMMANDS_LITERAL.ADD_TO_SET: {
        return this.encodeArrayUpdateCommand(query)
      }
      default: {
        return this.encodeFieldUpdateCommand(query)
      }
    }
  }

  encodeFieldUpdateCommand(query: UpdateCommand): IQueryCondition {
    const $op = operatorToString(query.operator)

    switch (query.operator) {
      case UPDATE_COMMANDS_LITERAL.REMOVE: {
        return {
          [$op]: {
            [query.fieldName as string]: ''
          }
        }
      }
      default: {
        return {
          [$op]: {
            [query.fieldName as string]: query.operands[0]
          }
        }
      }
    }
  }

  encodeArrayUpdateCommand(query: UpdateCommand): IQueryCondition {
    const $op = operatorToString(query.operator)

    switch (query.operator) {
      case UPDATE_COMMANDS_LITERAL.PUSH: {
        let modifiers
        if (isArray(query.operands)) {
          modifiers = {
            $each: query.operands.map(encodeInternalDataType)
          }
        } else {
          modifiers = query.operands
        }

        return {
          [$op]: {
            [query.fieldName as string]: modifiers
          }
        }
      }
      case UPDATE_COMMANDS_LITERAL.UNSHIFT: {
        const modifiers: IPushModifiers = {
          $each: query.operands.map(encodeInternalDataType),
          $position: 0
        }

        return {
          [$op]: {
            [query.fieldName as string]: modifiers
          }
        }
      }
      case UPDATE_COMMANDS_LITERAL.POP: {
        return {
          [$op]: {
            [query.fieldName as string]: 1
          }
        }
      }
      case UPDATE_COMMANDS_LITERAL.SHIFT: {
        return {
          [$op]: {
            [query.fieldName as string]: -1
          }
        }
      }
      default: {
        return {
          [$op]: {
            [query.fieldName as string]: encodeInternalDataType(query.operands)
          }
        }
      }
    }
  }

  encodeUpdateObject(query: Record<string, any>): IQueryCondition {
    const flattened = flattenQueryObject(query)
    for (const key in flattened) {
      if (/^\$/.test(key)) continue

      let val = flattened[key]
      if (isUpdateCommand(val)) {
        flattened[key] = val._setFieldName(key)
        const condition = this.encodeUpdateCommand(flattened[key])
        mergeConditionAfterEncode(flattened, condition, key)
      } else {
        // $set
        flattened[key] = val = encodeInternalDataType(val)
        const $setCommand = new UpdateCommand(
          UPDATE_COMMANDS_LITERAL.SET,
          [val],
          key
        )
        const condition = this.encodeUpdateCommand($setCommand)
        mergeConditionAfterEncode(flattened, condition, key)
      }
    }
    return flattened
  }
}

/**

{
  a: {
    a1: _.set({ a11: 'test' }),
    a2: _.inc(10)
  },
}

=>

{
  a: {
    a1: $set({ a11: 'test' }),
    a2: $inc(10)
  }
}

=>

{
  'a.a1': $set({ a11: 'test' }),
  'a.a2': $inc(10)
}

=>

{
  $set: {
    'a.a1': {
      a11: 'test'
    }
  },
  $inc: {
    'a.a2': 10
  }
}

*/
