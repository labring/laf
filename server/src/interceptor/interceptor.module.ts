import { Module } from '@nestjs/common'
import { HttpInterceptorService } from './http-interceptor.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [HttpInterceptorService],
  exports: [HttpInterceptorService],
})
export class InterceptorModule {}
