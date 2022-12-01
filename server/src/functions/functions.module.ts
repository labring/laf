import { Module } from '@nestjs/common'
import { ApplicationsModule } from 'src/applications/applications.module'
import { CoreModule } from '../core/core.module'
import { FunctionsController } from './functions.controller'

@Module({
  imports: [CoreModule, ApplicationsModule],
  controllers: [FunctionsController],
  providers: [],
})
export class FunctionsModule {}
