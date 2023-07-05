import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { PatService } from './pat.service'
import { PatController } from './pat.controller'
import { UserController } from './user.controller'

@Module({
  providers: [UserService, PatService],
  exports: [UserService],
  controllers: [PatController, UserController],
})
export class UserModule {}
