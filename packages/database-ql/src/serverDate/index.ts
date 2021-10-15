import { SYMBOL_SERVER_DATE } from '../helper/symbol'

export class ServerDate {
  readonly offset: number

  constructor({ offset = 0 } = {}) {
    this.offset = offset
  }

  get _internalType() {
    return SYMBOL_SERVER_DATE
  }

  parse() {
    return {
      $date: {
        offset: this.offset
      }
    }
  }
}

/**
 * @deprecated This method is deprecated, not implemented in server side
 * @param opt 
 * @returns 
 */
export function ServerDateConstructor(opt?: { offset: number }) {
  return new ServerDate(opt)
}