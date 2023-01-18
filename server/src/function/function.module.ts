import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ApplicationModule } from '../application/application.module'
import { PrismaService } from '../prisma.service'
import { FunctionController } from './function.controller'
import { FunctionService } from './function.service'
import { DatabaseModule } from 'src/database/database.module'

@Module({
  imports: [ApplicationModule, DatabaseModule],
  controllers: [FunctionController],
  providers: [FunctionService, PrismaService, JwtService],
  exports: [FunctionService],
})
export class FunctionModule {}
