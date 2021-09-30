import { SYMBOL_REGEXP } from '../helper/symbol'

export class RegExp {
  $regex: string;
  $options: string;
  constructor({ regexp, options }: { regexp: string, options: string}) {
    if (!regexp) {
      throw new TypeError('regexp must be a string')
    }
    this.$regex = regexp
    this.$options = options ?? ''
  }

  parse() {
    return {
      $regex: this.$regex,
      $options: this.$options
    }
  }

  get _internalType() {
    return SYMBOL_REGEXP
  }
}

export function RegExpConstructor(param: { regexp: string, options: string}) {
  return new RegExp(param)
}
