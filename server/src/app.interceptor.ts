import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common'
import { Observable, from, mergeMap, of } from 'rxjs'
import { HttpInterceptorService } from './interceptor/http-interceptor.service'
import {
  HttpInterceptorAction,
  HttpInterceptorResponseDto,
} from './interceptor/dto/http-interceptor.dto'
import { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(private httpInterceptorService: HttpInterceptorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response: Response = context.switchToHttp().getResponse()
    const requestId = uuidv4()

    return from(
      this.httpInterceptorService.processPreInterceptor(context, requestId),
    ).pipe(
      mergeMap((preInterceptorData: HttpInterceptorResponseDto) => {
        if (preInterceptorData.action === HttpInterceptorAction.DENY) {
          return this.handleDenyAction(response, preInterceptorData)
        }

        // post interceptor
        if (preInterceptorData.action === HttpInterceptorAction.ALLOW) {
          return next.handle().pipe(
            mergeMap((data) =>
              from(
                this.httpInterceptorService.processPostInterceptor(
                  context,
                  requestId,
                  data,
                ),
              ).pipe(
                mergeMap((postInterceptorData: HttpInterceptorResponseDto) => {
                  if (
                    postInterceptorData.action === HttpInterceptorAction.DENY
                  ) {
                    return this.handleDenyAction(response, postInterceptorData)
                  }
                  return of(data)
                }),
              ),
            ),
          )
        }
      }),
    )
  }

  handleDenyAction(
    response: Response,
    interceptorData: HttpInterceptorResponseDto,
  ) {
    if (interceptorData.rewrite) {
      response.status(interceptorData.rewrite.status || 200)
      return of(interceptorData.rewrite.data)
    }
    if (interceptorData.redirect) {
      response.status(interceptorData.redirect.status || 302)
      response.redirect(interceptorData.redirect.data)
      return of(null)
    }
    throw new ForbiddenException(
      interceptorData.denyMessage || "You don't have permission to access",
    )
  }
}
