import { Module } from '@nestjs/common'
import { BillingService } from './billing.service'
import { ResourceService } from './resource.service'
import { BillingController } from './billing.controller'
import { BillingTaskService } from './billing-task.service'
import { ApplicationModule } from 'src/application/application.module'
import { ResourceController } from './resource.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [BillingController, ResourceController],
  providers: [BillingService, ResourceService, BillingTaskService],
  exports: [BillingService, ResourceService],
})
export class BillingModule {}
