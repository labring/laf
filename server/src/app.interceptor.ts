import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { InterceptorService } from './interceptor/interceptor.service'

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(private interceptorService: InterceptorService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    await this.interceptorService.interceptor(context)
    return next.handle()
  }
}
