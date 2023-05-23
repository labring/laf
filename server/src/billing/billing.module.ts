import { Module } from '@nestjs/common'
import { BillingService } from './billing.service'
import { ResourceService } from './resource.service'
import { BillingController } from './billing.controller'

@Module({
  controllers: [BillingController],
  providers: [BillingService, ResourceService],
  exports: [BillingService, ResourceService],
})
export class BillingModule {}
