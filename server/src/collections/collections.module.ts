import { Module } from '@nestjs/common'
import { CollectionsService } from './collections.service'
import { CollectionsController } from './collections.controller'
import { CoreModule } from '../core/core.module'

@Module({
  imports: [CoreModule],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
