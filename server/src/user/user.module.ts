import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { PatService } from './pat.service'
import { PatController } from './pat.controller'
import { UserController } from './user.controller'
import { QuotaService } from './quota.service'
import { ApplicationService } from 'src/application/application.service'
import { SettingService } from 'src/setting/setting.service'

@Module({
  providers: [
    UserService,
    PatService,
    QuotaService,
    ApplicationService,
    SettingService,
  ],
  exports: [UserService],
  controllers: [PatController, UserController],
})
export class UserModule {}
