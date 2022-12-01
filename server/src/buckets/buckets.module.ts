import { Module } from '@nestjs/common'
import { BucketsController } from './buckets.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationsModule } from 'src/applications/applications.module'

@Module({
  imports: [CoreModule, ApplicationsModule],
  controllers: [BucketsController],
  providers: [],
})
export class BucketsModule {}
