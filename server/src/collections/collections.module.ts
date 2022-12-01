import { Module } from '@nestjs/common'
import { CollectionsService } from './collections.service'
import { CollectionsController } from './collections.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationsModule } from 'src/applications/applications.module'

@Module({
  imports: [CoreModule, ApplicationsModule],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
