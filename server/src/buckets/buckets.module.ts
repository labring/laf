import { Module } from '@nestjs/common'
import { BucketsService } from './buckets.service'
import { BucketsController } from './buckets.controller'
import { ApplicationsService } from 'src/applications/applications.service'

@Module({
  controllers: [BucketsController],
  providers: [BucketsService, ApplicationsService],
})
export class BucketsModule {}
