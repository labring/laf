import { InternalSymbol, SYMBOL_UNSET_FIELD_NAME, SYMBOL_LOGIC_COMMAND } from '../helper/symbol'
import { isQueryCommand } from './query'

export const AND = 'and'
export const OR = 'or'
export const NOT = 'not'
export const NOR = 'nor'

export enum LOGIC_COMMANDS_LITERAL {
  AND = 'and',
  OR = 'or',
  NOT = 'not',
  NOR = 'nor',
}

export class LogicCommand {

  public fieldName: string | InternalSymbol
  public operator: LOGIC_COMMANDS_LITERAL | string
  public operands: any[]
  public _internalType = SYMBOL_LOGIC_COMMAND

  constructor(operator: LOGIC_COMMANDS_LITERAL | string, operands: any, fieldName?: string | InternalSymbol) {

    Object.defineProperties(this, {
      _internalType: {
        enumerable: false,
        configurable: false,
      },
    })

    this.operator = operator
    this.operands = operands
    this.fieldName = fieldName || SYMBOL_UNSET_FIELD_NAME

    if (this.fieldName !== SYMBOL_UNSET_FIELD_NAME) {
      if (Array.isArray(operands)) {
        operands = operands.slice()
        this.operands = operands
        for (let i = 0, len = operands.length; i < len; i++) {
          const query = operands[i]
          if (isLogicCommand(query) || isQueryCommand(query)) {
            operands[i] = query._setFieldName(this.fieldName as string)
          }
        }
      } else {
        const query = operands
        if (isLogicCommand(query) || isQueryCommand(query)) {
          operands = query._setFieldName(this.fieldName as string)
        }
      }
    }

    /*
    Object.defineProperties(this, {
      operator: {
        configurable: true,
        enumerable: true,
        writable: false,
        value: operator,
      },
      operands: {
        configurable: true,
        enumerable: true,
        writable: false,
        value: operands,
      },
      fieldName: {
        configurable: true,
        enumerable: true,
        get() {
          return _fieldName
        },
        set(val) {
          _fieldName = val
        }
      }
    })
    */
  }

  _setFieldName(fieldName: string): LogicCommand {
    const operands = this.operands.map(operand => {
      if (operand instanceof LogicCommand) {
        return operand._setFieldName(fieldName)
      } else {
        return operand
      }
    })

    const command = new LogicCommand(this.operator, operands, fieldName)
    return command
  }

  /**
   * Support only command[] or ...command in v1
   * @param {(LogicCommand[]|object[]|...LogicCommand|...object)} expressions Command[] or ...Command
   */
  and(...__expressions__: LogicCommand[]) {
    const expressions: any[] = Array.isArray(arguments[0]) ? arguments[0] : Array.from(arguments)
    expressions.unshift(this)
    return new LogicCommand(LOGIC_COMMANDS_LITERAL.AND, expressions, this.fieldName)
  }

  /**
   * Support only command[] or ...command in v1
   * @param {(LogicCommand[]|object[]|...LogicCommand|...object)} expressions Command[] or ...Command
   */
  or(...__expressions__: LogicCommand[]) {
    const expressions: any[] = Array.isArray(arguments[0]) ? arguments[0] : Array.from(arguments)
    expressions.unshift(this)
    return new LogicCommand(LOGIC_COMMANDS_LITERAL.OR, expressions, this.fieldName)
  }

  /**
   * @param {QueryCommand} expression Command
   */
  /*
  not(expression: DB.DatabaseQueryCommand) {
    assertRequiredParam(expression, 'expression', 'not')
    return new LogicCommand(LOGIC_COMMANDS_LITERAL.NOT, [expression], this.fieldName)
  }
  */

}

export function isLogicCommand(object: any): object is LogicCommand {
  return object && (object instanceof LogicCommand) && (object._internalType === SYMBOL_LOGIC_COMMAND)
}

export function isKnownLogicCommand(object: any): object is LogicCommand {
  return isLogicCommand && (object.operator.toUpperCase() in LOGIC_COMMANDS_LITERAL)
}

export default LogicCommand
