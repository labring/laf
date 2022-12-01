import { Module } from '@nestjs/common'
import { CoreModule } from '../core/core.module'
import { FunctionsController } from './functions.controller'

@Module({
  imports: [CoreModule],
  controllers: [FunctionsController],
  providers: [],
})
export class FunctionsModule {}
