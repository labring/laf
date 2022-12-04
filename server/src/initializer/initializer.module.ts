import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { InitializerService } from './initializer.service'

@Module({
  providers: [InitializerService, PrismaService],
})
export class InitializerModule {}
