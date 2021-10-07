import { AccessorInterface } from "../accessor"
import { Db } from 'database-ql'
import { Request } from "./request"

export function getDb(accessor: AccessorInterface): Db {
    return new Db({
        request: new Request(accessor)
    })
}