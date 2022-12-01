import { Module } from '@nestjs/common'
import { BucketsController } from './buckets.controller'
import { CoreModule } from '../core/core.module'

@Module({
  imports: [CoreModule],
  controllers: [BucketsController],
  providers: [],
})
export class BucketsModule {}
