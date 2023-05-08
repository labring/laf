import { Injectable, Logger } from '@nestjs/common'
import { ApplicationConfiguration } from '@prisma/client'
import { CN_PUBLISHED_CONF } from 'src/constants'
import { DatabaseService } from 'src/database/database.service'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ApplicationConfigurationService {
  private readonly logger = new Logger(ApplicationConfigurationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseService: DatabaseService,
  ) {}

  async count(appid: string) {
    return this.prisma.applicationConfiguration.count({ where: { appid } })
  }

  async remove(appid: string) {
    return this.prisma.applicationConfiguration.delete({ where: { appid } })
  }

  async publish(conf: ApplicationConfiguration) {
    const { db, client } = await this.databaseService.findAndConnect(conf.appid)
    const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_CONF)
        await coll.deleteOne({ appid: conf.appid }, { session })
        await coll.insertOne(conf, { session })
      })
    } finally {
      await client.close()
    }
  }
}
