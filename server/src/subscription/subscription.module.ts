import { Module } from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionTaskService } from './subscription-task.service'
import { ApplicationService } from 'src/application/application.service'
import { SubscriptionRenewalTaskService } from './renewal-task.service'
import { AccountModule } from 'src/account/account.module'

@Module({
  imports: [AccountModule],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionTaskService,
    ApplicationService,
    SubscriptionRenewalTaskService,
  ],
})
export class SubscriptionModule {}
