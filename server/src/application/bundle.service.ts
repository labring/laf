import { Injectable, Logger } from '@nestjs/common'
import { ApplicationBundle } from 'src/application/entities/application-bundle'
import { SystemDatabase } from 'src/system-database'

@Injectable()
export class BundleService {
  private readonly logger = new Logger(BundleService.name)
  private readonly db = SystemDatabase.db

  async findOne(appid: string) {
    const bundle = await this.db
      .collection<ApplicationBundle>('ApplicationBundle')
      .findOne({ appid })

    return bundle
  }

  async deleteOne(appid: string) {
    const res = await this.db
      .collection<ApplicationBundle>('ApplicationBundle')
      .findOneAndDelete({ appid })

    return res.value
  }
}
