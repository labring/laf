import { Module } from '@nestjs/common'
import { ApplicationsController } from './applications.controller'
import { SpecsController } from './specs.controller'
import { CoreModule } from '../core/core.module'

@Module({
  imports: [CoreModule],
  controllers: [ApplicationsController, SpecsController],
  providers: [],
})
export class ApplicationsModule {}
