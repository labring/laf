import { Module } from '@nestjs/common'
import { BillingService } from './billing.service'
import { ResourceService } from './resource.service'
import { BillingController } from './billing.controller'
import { BillingTaskService } from './billing-task.service'

@Module({
  controllers: [BillingController],
  providers: [BillingService, ResourceService, BillingTaskService],
  exports: [BillingService, ResourceService],
})
export class BillingModule {}
