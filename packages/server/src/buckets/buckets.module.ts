import { Module } from '@nestjs/common';
import { BucketsService } from './buckets.service';
import { BucketsController } from './buckets.controller';

@Module({
  controllers: [BucketsController],
  providers: [BucketsService]
})
export class BucketsModule {}
