import { Module } from '@nestjs/common'
import { ApplicationModule } from 'src/application/application.module'
import { DependencyController } from './dependency.controller'
import { DependencyService } from './dependency.service'

@Module({
  imports: [ApplicationModule],
  controllers: [DependencyController],
  providers: [DependencyService],
  exports: [DependencyService],
})
export class DependencyModule {}
