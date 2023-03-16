/**
 * PriceRound()
 * - keep two decimals
 * - 1.234 => 1.23
 * - 1.235 => 1.24
 *
 * Special case:
 * - capitalize the first letter of this function name to make it like a constructor
 * @param price
 * @returns
 */
export function PriceRound(price: number | string) {
  const priceNum = Number(price)
  return Math.round(priceNum * 100) / 100
}

export function PriceAdd(price1: number | string, price2: number | string) {
  const price1Num = Number(price1)
  const price2Num = Number(price2)
  return PriceRound(price1Num + price2Num)
}

export function PriceSub(price1: number | string, price2: number | string) {
  const price1Num = Number(price1)
  const price2Num = Number(price2)
  return PriceRound(price1Num - price2Num)
}

export function PriceMul(price1: number | string, price2: number | string) {
  const price1Num = Number(price1)
  const price2Num = Number(price2)
  return PriceRound(price1Num * price2Num)
}

export function PriceDiv(price1: number | string, price2: number | string) {
  const price1Num = Number(price1)
  const price2Num = Number(price2)
  return PriceRound(price1Num / price2Num)
}
