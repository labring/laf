import { HttpService } from '@nestjs/axios'
import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { HTTP_INTERCEPTOR_TIMEOUT, HTTP_INTERCEPTOR_URL } from 'src/constants'
import { HttpInterceptorAction } from './dto/http-interceptor.dto'

@Injectable()
export class InterceptorService {
  constructor(private httpService: HttpService) {}

  private readonly logger = new Logger(InterceptorService.name)

  async httpInterceptor(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const data = {
      url: request.url,
      method: request.method,
      headers: request.headers,
      user: request.user,
      params: request.params,
      query: request.query,
      body: request.body,
    }
    if (HTTP_INTERCEPTOR_URL.length === 0) {
      return {
        action: HttpInterceptorAction.ALLOW,
      }
    }

    try {
      const httpInterceptorResponse = await this.httpService.axiosRef.post(
        HTTP_INTERCEPTOR_URL,
        data,
        { timeout: HTTP_INTERCEPTOR_TIMEOUT },
      )
      console.log(httpInterceptorResponse.data)
      return httpInterceptorResponse.data
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        this.logger.error('Request timed out!')
      } else {
        this.logger.error(error)
      }

      return {
        action: HttpInterceptorAction.ALLOW,
      }
    }
  }
}
