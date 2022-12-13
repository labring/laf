import { Module } from '@nestjs/common'
import { CollectionService } from './collection.service'
import { CollectionController } from './collection.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationModule } from '../application/application.module'
import { PolicyController } from './policy.controller'
import { PolicyService } from './policy.service'
import { DatabaseService } from './database.service'
import { DatabaseController } from './database.controller'

@Module({
  imports: [CoreModule, ApplicationModule],
  controllers: [CollectionController, PolicyController, DatabaseController],
  providers: [CollectionService, PolicyService, DatabaseService],
})
export class DatabaseModule {}
