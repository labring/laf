import { Injectable } from '@nestjs/common'
import { DatabaseCoreService } from 'src/core/database.cr.service'
import * as assert from 'node:assert'
import { MongoAccessor } from 'database-proxy'

@Injectable()
export class DatabaseService {
  constructor(private readonly dbCore: DatabaseCoreService) {}

  /**
   * Get database accessor that used for `database-proxy`
   * @param appid
   * @returns
   */
  async getDatabaseAccessor(appid: string) {
    const database = await this.dbCore.findOne(appid)
    assert(database, 'Database not found')

    const dbName = database.metadata.name
    const connectionUri = database.status?.connectionUri
    assert(connectionUri, 'Database connection uri not found')

    const accessor = new MongoAccessor(dbName, connectionUri)
    await accessor.init()
    return accessor
  }
}
