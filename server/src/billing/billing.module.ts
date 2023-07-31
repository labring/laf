import { Module } from '@nestjs/common'
import { BillingService } from './billing.service'
import { ResourceService } from './resource.service'
import { BillingController } from './billing.controller'
import { BillingCreationTaskService } from './billing-creation-task.service'
import { ApplicationModule } from 'src/application/application.module'
import { ResourceController } from './resource.controller'
import { BillingPaymentTaskService } from './billing-payment-task.service'
import { DatabaseModule } from 'src/database/database.module'
import { RegionModule } from 'src/region/region.module'
import { StorageModule } from 'src/storage/storage.module'

@Module({
  imports: [ApplicationModule, DatabaseModule, RegionModule, StorageModule],
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
