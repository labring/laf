import { Injectable, Logger } from '@nestjs/common'
import { CreateEnvironmentDto } from './dto/create-env.dto'
import { ApplicationConfigurationService } from './configuration.service'
import { SystemDatabase } from 'src/system-database'
import { ApplicationConfiguration } from './entities/application-configuration'
import * as assert from 'node:assert'

@Injectable()
export class EnvironmentVariableService {
  private readonly db = SystemDatabase.db
  private readonly logger = new Logger(EnvironmentVariableService.name)

  constructor(private readonly confService: ApplicationConfigurationService) {}

  async updateAll(appid: string, dto: CreateEnvironmentDto[]) {
    const res = await this.db
      .collection<ApplicationConfiguration>('ApplicationConfiguration')
      .findOneAndUpdate(
        { appid },
        { $set: { environments: dto, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    assert(res?.value, 'application configuration not found')
    await this.confService.publish(res.value)
    return res.value.environments
  }

  /**
   * if exists, update, else create
   * @param appid
   * @param dto
   */
  async setOne(appid: string, dto: CreateEnvironmentDto) {
    const origin = await this.findAll(appid)
    // check if exists
    const exists = origin.find((item) => item.name === dto.name)
    if (exists) {
      exists.value = dto.value
    } else {
      origin.push(dto)
    }

    const res = await this.db
      .collection<ApplicationConfiguration>('ApplicationConfiguration')
      .findOneAndUpdate(
        { appid },
        { $set: { environments: origin, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    assert(res?.value, 'application configuration not found')
    await this.confService.publish(res.value)
    return res.value.environments
  }

  async findAll(appid: string) {
    const doc = await this.db
      .collection<ApplicationConfiguration>('ApplicationConfiguration')
      .findOne({ appid })

    return doc.environments
  }

  async deleteOne(appid: string, name: string) {
    const res = await this.db
      .collection<ApplicationConfiguration>('ApplicationConfiguration')
      .findOneAndUpdate(
        { appid },
        { $pull: { environments: { name } } },
        { returnDocument: 'after' },
      )

    assert(res?.value, 'application configuration not found')
    await this.confService.publish(res.value)
    return res.value.environments
  }
}
