import { Injectable, Logger } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { Setting } from './entities/setting'

@Injectable()
export class SettingService {
  private readonly logger = new Logger(SettingService.name)
  private readonly db = SystemDatabase.db

  async findAll() {
    return await this.db.collection<Setting>('Setting').find().toArray()
  }

  async findOne(key: string) {
    return await this.db.collection<Setting>('Setting').findOne({ key })
  }
}
