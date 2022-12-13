import { Module } from '@nestjs/common'
import { CollectionsService } from '../database/collections.service'
import { CollectionsController } from '../database/collections.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationModule } from '../application/application.module'
import { PoliciesController } from './policies.controller'
import { PoliciesService } from './policies.service'
import { DatabaseService } from './database.service'
import { DatabaseController } from './database.controller'

@Module({
  imports: [CoreModule, ApplicationModule],
  controllers: [CollectionsController, PoliciesController, DatabaseController],
  providers: [CollectionsService, PoliciesService, DatabaseService],
})
export class DatabaseModule {}
