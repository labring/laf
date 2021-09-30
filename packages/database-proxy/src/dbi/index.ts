import { AccessorInterface } from "../accessor"
import { Db } from 'less-api-database'
import { Request } from "./request"

export interface DbConfig {
    accessor: AccessorInterface
}

export function getDb(accessor: AccessorInterface): Db {
   
    const config: DbConfig = {
        accessor
    }

    Db.reqClass = Request
    Db.getAccessToken = () => {}

    return new Db(config)
}