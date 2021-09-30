import { SYMBOL_SERVER_DATE } from '../helper/symbol'

export class ServerDate {
    readonly offset: number;

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

export function ServerDateConstructor(opt) {
  return new ServerDate(opt)
}