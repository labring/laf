import { Injectable, Logger } from '@nestjs/common'
import { DatabaseService } from './database.service'
import { CreateCollectionDto } from './dto/create-collection.dto'
import { UpdateCollectionDto } from './dto/update-collection.dto'
import * as assert from 'node:assert'

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name)
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create collection in database
   * @param appid
   * @param dto
   * @returns
   */
  async create(appid: string, dto: CreateCollectionDto) {
    assert(appid, 'appid is required')
    const { client, db } = await this.databaseService.findAndConnect(appid)
    assert(db, 'Database not found')
    try {
      await db.createCollection(dto.name)
      await client.close()
      return true
    } catch (error) {
      this.logger.error(error)
      await client.close()
      return false
    }
  }

  findAll() {
    return `This action returns all collections`
  }

  findOne(id: number) {
    return `This action returns a #${id} collection`
  }

  update(id: number, updateCollectionDto: UpdateCollectionDto) {
    return `This action updates a #${id} collection`
  }

  remove(id: number) {
    return `This action removes a #${id} collection`
  }
}
