import { Global, Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationTaskService } from './notification-task.service'
import { NotificationController } from './notification.controller'
import { HttpModule } from '@nestjs/axios'
import { UserModule } from 'src/user/user.module'

@Global()
@Module({
  providers: [NotificationService, NotificationTaskService],
  exports: [NotificationService],
  controllers: [NotificationController],
  imports: [HttpModule, UserModule],
})
export class NotificationModule {}
