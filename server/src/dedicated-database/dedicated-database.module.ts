import { Module } from '@nestjs/common'
import { DedicatedDatabaseService } from '../database/dedicated-database/dedicated-database.service'
import { DedicatedDatabaseMonitorService } from '../database/monitor/monitor.service'
import { DedicatedDatabaseMonitorController } from '../database/monitor/monitor.controller'

@Module({
  controllers: [DedicatedDatabaseMonitorController],
  providers: [DedicatedDatabaseService, DedicatedDatabaseMonitorService],
})
export class DedicatedDatabaseModule {}
