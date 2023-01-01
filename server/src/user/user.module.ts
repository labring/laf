import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UserService } from './user.service'
import { PatService } from './pat.service'
import { PatController } from './pat.controller'

@Module({
  providers: [UserService, PrismaService, PatService],
  exports: [UserService],
  controllers: [PatController],
})
export class UserModule {}
