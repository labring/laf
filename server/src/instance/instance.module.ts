import { Module } from '@nestjs/common'
import { InstanceService } from './instance.service'
import { InstanceTaskService } from './instance-task.service'
import { CoreModule } from '../core/core.module'
import { PrismaService } from '../prisma.service'
import { StorageModule } from 'src/storage/storage.module'
import { DatabaseModule } from 'src/database/database.module'

@Module({
  imports: [CoreModule, StorageModule, DatabaseModule],
  providers: [InstanceService, InstanceTaskService, PrismaService],
})
export class InstanceModule {}
