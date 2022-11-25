import { Module } from '@nestjs/common'
import { CollectionsService } from './collections.service'
import { CollectionsController } from './collections.controller'
import { DatabaseService } from './database.service'
import { ApplicationsService } from 'src/applications/applications.service'

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService, DatabaseService, ApplicationsService],
})
export class CollectionsModule {}
