import InternalSymbol from '../utils/symbol'
export * from '../utils/symbol'

export const SYMBOL_UNSET_FIELD_NAME = InternalSymbol.for('UNSET_FIELD_NAME')

export const SYMBOL_UPDATE_COMMAND = InternalSymbol.for('UPDATE_COMMAND')
export const SYMBOL_QUERY_COMMAND = InternalSymbol.for('QUERY_COMMAND')
export const SYMBOL_LOGIC_COMMAND = InternalSymbol.for('LOGIC_COMMAND')

export const SYMBOL_GEO_POINT = InternalSymbol.for('GEO_POINT')
export const SYMBOL_GEO_LINE_STRING = InternalSymbol.for('SYMBOL_GEO_LINE_STRING')
export const SYMBOL_GEO_POLYGON = InternalSymbol.for('SYMBOL_GEO_POLYGON')
export const SYMBOL_GEO_MULTI_POINT = InternalSymbol.for('SYMBOL_GEO_MULTI_POINT')
export const SYMBOL_GEO_MULTI_LINE_STRING = InternalSymbol.for('SYMBOL_GEO_MULTI_LINE_STRING')
export const SYMBOL_GEO_MULTI_POLYGON = InternalSymbol.for('SYMBOL_GEO_MULTI_POLYGON')

export const SYMBOL_SERVER_DATE = InternalSymbol.for('SERVER_DATE')

export const SYMBOL_REGEXP = InternalSymbol.for('REGEXP')
