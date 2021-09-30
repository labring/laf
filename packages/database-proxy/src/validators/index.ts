
import { ConditionHandler } from './condition'
import { DataHandler } from './data'
import { QueryHandler } from './query'
import { MultiHandler } from "./multi"
import { JoinHandler } from './join'


export const condition = ConditionHandler
export const cond = ConditionHandler    // alias of condition

export const data = DataHandler
export const schema = DataHandler       // alias of data
export const query = QueryHandler
export const multi = MultiHandler
export const join = JoinHandler