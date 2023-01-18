import { Module } from '@nestjs/common'
import { InstanceService } from './instance.service'
import { InstanceTaskService } from './instance-task.service'
import { PrismaService } from '../prisma.service'
import { StorageModule } from '../storage/storage.module'
import { DatabaseModule } from '../database/database.module'
import { RegionModule } from '../region/region.module'

@Module({
  imports: [StorageModule, DatabaseModule, RegionModule],
  providers: [InstanceService, InstanceTaskService, PrismaService],
})
export class InstanceModule {}
