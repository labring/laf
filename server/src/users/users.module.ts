import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UsersService } from './users.service'

@Module({
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
