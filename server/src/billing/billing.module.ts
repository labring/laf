import { Module } from '@nestjs/common'
import { BillingService } from './billing.service'
import { ResourceService } from './resource.service'
import { BillingController } from './billing.controller'
import { BillingCreationTaskService } from './billing-creation-task.service'
import { ApplicationModule } from 'src/application/application.module'
import { ResourceController } from './resource.controller'
import { BillingPaymentTaskService } from './billing-payment-task.service'

@Module({
  imports: [ApplicationModule],
  controllers: [BillingController, ResourceController],
  providers: [
    BillingService,
    ResourceService,
    BillingCreationTaskService,
    BillingPaymentTaskService,
  ],
  exports: [BillingService, ResourceService],
})
export class BillingModule {}
