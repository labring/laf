import { Module } from '@nestjs/common'
import { ApplicationsService } from './applications.service'
import { ApplicationsController } from './applications.controller'
import { BundlesService } from './bundles.service'
import { RuntimesService } from './runtimes.service'
import { SpecsController } from './specs.controller'

@Module({
  controllers: [ApplicationsController, SpecsController],
  providers: [ApplicationsService, BundlesService, RuntimesService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
