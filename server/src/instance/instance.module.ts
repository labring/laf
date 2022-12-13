import { Module } from '@nestjs/common'
import { InstanceService } from './instance.service'
import { InstanceTaskService } from './instance-task.service'
import { CoreModule } from '../core/core.module'
import { PrismaService } from '../prisma.service'

@Module({
  imports: [CoreModule],
  providers: [InstanceService, InstanceTaskService, PrismaService],
})
export class InstanceModule {}
