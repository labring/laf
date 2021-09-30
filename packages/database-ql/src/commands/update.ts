import { InternalSymbol, SYMBOL_UNSET_FIELD_NAME, SYMBOL_UPDATE_COMMAND } from '../helper/symbol'

export enum UPDATE_COMMANDS_LITERAL {
  SET = 'set',
  REMOVE = 'remove',
  INC = 'inc',
  MUL = 'mul',
  PUSH = 'push',
  PULL = 'pull',
  PULL_ALL = 'pullAll',
  POP = 'pop',
  SHIFT = 'shift',
  UNSHIFT = 'unshift',
  ADD_TO_SET = 'addToSet',
  BIT = 'bit',
  RENAME = 'rename',
  MAX = 'max',
  MIN = 'min'
}

export class UpdateCommand {

  public fieldName: string | InternalSymbol
  public operator: UPDATE_COMMANDS_LITERAL
  public operands: any
  public _internalType = SYMBOL_UPDATE_COMMAND

  constructor(operator: UPDATE_COMMANDS_LITERAL, operands?: any, fieldName?: string | InternalSymbol) {

    Object.defineProperties(this, {
      _internalType: {
        enumerable: false,
        configurable: false,
      },
    })

    this.operator = operator
    this.operands = operands
    this.fieldName = fieldName || SYMBOL_UNSET_FIELD_NAME
  }

  _setFieldName(fieldName: string): UpdateCommand {
    const command = new UpdateCommand(this.operator, this.operands, fieldName)
    return command
  }
}

export function isUpdateCommand(object: any): object is UpdateCommand {
  return object && (object instanceof UpdateCommand) && (object._internalType === SYMBOL_UPDATE_COMMAND)
}

export function isKnownUpdateCommand(object: any): object is UpdateCommand {
  return isUpdateCommand(object) && (object.operator.toUpperCase() in UPDATE_COMMANDS_LITERAL)
}

export default UpdateCommand
