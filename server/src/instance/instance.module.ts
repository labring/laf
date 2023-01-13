import { Module } from '@nestjs/common'
import { InstanceService } from './instance.service'
import { InstanceTaskService } from './instance-task.service'
import { CoreModule } from '../core/core.module'
import { PrismaService } from '../prisma.service'
import { StorageModule } from 'src/storage/storage.module'

@Module({
  imports: [CoreModule, StorageModule],
  providers: [InstanceService, InstanceTaskService, PrismaService],
})
export class InstanceModule {}
