import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { PatService } from './pat.service'
import { PatController } from './pat.controller'
import { UserController } from './user.controller'
import { QuotaServiceTsService } from './quota.service.ts.service'

@Module({
  providers: [UserService, PatService, QuotaServiceTsService],
  exports: [UserService],
  controllers: [PatController, UserController],
})
export class UserModule {}
