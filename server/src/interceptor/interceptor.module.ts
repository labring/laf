import { Module } from '@nestjs/common'
import { InterceptorService } from './interceptor.service'

@Module({
  providers: [InterceptorService],
  exports: [InterceptorService],
})
export class InterceptorModule {}
