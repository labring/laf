import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { InterceptorService } from './interceptor/interceptor.service'
import {
  HttpInterceptorAction,
  HttpInterceptorResponseDto,
} from './interceptor/dto/http-interceptor.dto'

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(private interceptorService: InterceptorService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse()

    const httpInterceptorResponseData: HttpInterceptorResponseDto =
      await this.interceptorService.httpInterceptor(context)

    if (httpInterceptorResponseData.action === HttpInterceptorAction.ALLOW) {
      return next.handle()
    }
    if (httpInterceptorResponseData.action === HttpInterceptorAction.DENY) {
      if (httpInterceptorResponseData.rewrite) {
        return next.handle().pipe(
          map(() => {
            response.status(httpInterceptorResponseData.rewrite.status || 200)
            return httpInterceptorResponseData.rewrite.data
          }),
        )
      }
      if (httpInterceptorResponseData.redirect) {
        return next.handle().pipe(
          map(() => {
            response.status(302)
            response.redirect(httpInterceptorResponseData.redirect)
          }),
        )
      }
      throw new ForbiddenException("You don't have permission to access")
    }
  }
}
