import { Module } from '@nestjs/common'
import { ApplicationModule } from 'src/application/application.module'
import { PrismaService } from 'src/prisma.service'
import { DependencyController } from './dependency.controller'
import { DependencyService } from './dependency.service'

@Module({
  imports: [ApplicationModule],
  controllers: [DependencyController],
  providers: [DependencyService, PrismaService],
})
export class DependencyModule {}
