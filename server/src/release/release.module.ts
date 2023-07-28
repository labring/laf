import { Module } from '@nestjs/common'
import { NotificationModule } from 'src/notification/notification.module'
import { ReleaseProcessTaskService } from './release-process-task.service'
import { ReleaseStateTaskService } from './release-state-task.service'
import { ReleaseService } from './release.service'
import { UserModule } from 'src/user/user.module'
import { SettingModule } from 'src/setting/setting.module'

@Module({
  imports: [NotificationModule, UserModule, SettingModule],
  providers: [
    ReleaseProcessTaskService,
    ReleaseStateTaskService,
    ReleaseService,
  ],
})
export class ReleaseModule {}
