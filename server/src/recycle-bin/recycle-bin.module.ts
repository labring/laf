import { Module } from '@nestjs/common'
import { FunctionRecycleBinController } from './cloud-function/function-recycle-bin.controller'
import { FunctionRecycleBinService } from './cloud-function/function-recycle-bin.service'
import { FunctionModule } from 'src/function/function.module'

@Module({
  imports: [FunctionModule],
  controllers: [FunctionRecycleBinController],
  providers: [FunctionRecycleBinService],
  exports: [FunctionRecycleBinService],
})
export class RecycleBinModule {}
