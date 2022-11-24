import { Module } from '@nestjs/common'
import { FunctionsService } from './functions.service'
import { FunctionsController } from './functions.controller'
import { ApplicationsService } from 'src/applications/applications.service'

@Module({
  controllers: [FunctionsController],
  providers: [FunctionsService, ApplicationsService],
})
export class FunctionsModule {}
