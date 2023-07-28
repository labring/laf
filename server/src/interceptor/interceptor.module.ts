import { Module } from '@nestjs/common'
import { InterceptorService } from './interceptor.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [InterceptorService],
  exports: [InterceptorService],
})
export class InterceptorModule {}
