const _symbols: { target: any, instance: InternalSymbol }[] = []
const __internalMark__ = {}

class HiddenSymbol {

  constructor(target: any) {
    Object.defineProperties(this, {
      target: {
        enumerable: false,
        writable: false,
        configurable: false,
        value: target,
      },
    })
  }
}

export class InternalSymbol extends HiddenSymbol {

  constructor(target: any, __mark__: any) {
    if (__mark__ !== __internalMark__) {
      throw new TypeError('InternalSymbol cannot be constructed with new operator')
    }

    super(target)
  }

  static for(target: any) {

    for (let i = 0, len = _symbols.length; i < len; i++) {
      if (_symbols[i].target === target) {
        return _symbols[i].instance
      }
    }

    const symbol = new InternalSymbol(target, __internalMark__)

    _symbols.push({
      target,
      instance: symbol,
    })

    return symbol
  }
}

export default InternalSymbol

