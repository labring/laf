import { Injectable, Logger } from '@nestjs/common'
import { CreateCollectionDto } from '../dto/create-collection.dto'
import { UpdateCollectionDto } from '../dto/update-collection.dto'
import * as assert from 'node:assert'
import { DatabaseService } from '../database.service'

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name)
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create collection in database
   * @param appid
   * @param dto
   * @returns
   */
  async create(appid: string, dto: CreateCollectionDto) {
    const { client, db } = await this.databaseService.findAndConnect(appid)
    assert(db, 'Database not found')
    try {
      await db.createCollection(dto.name)
      return true
    } catch (error) {
      this.logger.error(error)
      return false
    } finally {
      await client.close()
    }
  }

  /**
   * Get collection list in database
   * @param appid
   * @returns
   */
  async findAll(appid: string) {
    const { client, db } = await this.databaseService.findAndConnect(appid)
    assert(db, 'Database not found')
    try {
      const collections = await db.listCollections().toArray()
      const result = collections.filter((coll) => !coll.name.startsWith('__'))
      return result
    } catch (error) {
      this.logger.error(error)
      return null
    } finally {
      await client.close()
    }
  }

  /**
   * TODO
   * @param appid
   * @param name
   * @returns
   */
  async findOne(appid: string, name: string) {
    return `This action returns a #${name} collection`
  }

  /**
   * Update collection, currently only support to update validatorSchema and validationLevel.
   * @param appid
   * @param name
   * @param dto
   * @returns
   */
  async update(appid: string, name: string, dto: UpdateCollectionDto) {
    const { client, db } = await this.databaseService.findAndConnect(appid)
    assert(db, 'Database not found')

    const command = {
      collMod: name,
      validationAction: 'error',
    }

    if (dto.validatorSchema) {
      command['validator'] = {
        $jsonSchema: dto.validatorSchema,
      }
    }

    if (['strict', 'off', 'moderate'].includes(dto.validationLevel)) {
      command['validationLevel'] = dto.validationLevel
    } else {
      command['validationLevel'] = 'strict'
    }

    try {
      await db.command(command)
      return true
    } catch (error) {
      this.logger.error(error)
      return false
    } finally {
      await client.close()
    }
  }

  /**
   * Drop a collection
   * @param appid
   * @param name
   * @returns
   */
  async remove(appid: string, name: string) {
    const { client, db } = await this.databaseService.findAndConnect(appid)
    assert(db, 'Database not found')
    try {
      const res = await db.dropCollection(name)
      return res
    } catch (error) {
      this.logger.error(error)
      return false
    } finally {
      await client.close()
    }
  }
}
