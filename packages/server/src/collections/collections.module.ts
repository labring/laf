import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService]
})
export class CollectionsModule {}
