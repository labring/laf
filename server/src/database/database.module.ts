import { Module } from '@nestjs/common'
import { CollectionsService } from '../database/collections.service'
import { CollectionsController } from '../database/collections.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationsModule } from '../applications/applications.module'
import { PoliciesController } from './policies.controller'
import { PoliciesService } from './policies.service'

@Module({
  imports: [CoreModule, ApplicationsModule],
  controllers: [CollectionsController, PoliciesController],
  providers: [CollectionsService, PoliciesService],
})
export class DatabaseModule {}
