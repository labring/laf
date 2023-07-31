import { HttpService } from '@nestjs/axios'
import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { HTTP_INTERCEPTOR_TIMEOUT, HTTP_INTERCEPTOR_URL } from 'src/constants'
import { HttpInterceptorAction } from './dto/http-interceptor.dto'
import { Response } from 'express'
import { Request } from 'express'

@Injectable()
export class InterceptorService {
  constructor(private httpService: HttpService) {}

  private readonly logger = new Logger(InterceptorService.name)
  private readonly HTTP_INTERCEPTOR_URL = HTTP_INTERCEPTOR_URL
  private readonly HTTP_INTERCEPTOR_TIMEOUT = HTTP_INTERCEPTOR_TIMEOUT

  async processPreInterceptor(context: ExecutionContext, requestId: string) {
    const request: Request = context.switchToHttp().getRequest()
    const requestData = this.buildRequestData(request, requestId)
    return this.sendRequestToInterceptor(requestData)
  }

  async processPostInterceptor(
    context: ExecutionContext,
    requestId: string,
    data: any,
  ) {
    const response: Response = context.switchToHttp().getResponse()
    const responseData = this.buildResponseData(response, requestId, data)
    return this.sendRequestToInterceptor(responseData)
  }

  buildRequestData(request: Request, requestId: string) {
    return {
      url: request.url,
      method: request.method,
      headers: request.headers,
      user: request.user,
      params: request.params,
      query: request.query,
      body: request.body,
      id: requestId,
      state: 'pre',
    }
  }
  buildResponseData(response: Response, requestId: string, data: any): any {
    return {
      id: requestId,
      headers: response.getHeaders(),
      data: data,
      state: 'post',
    }
  }

  async sendRequestToInterceptor(data: any) {
    try {
      const response = await this.httpService.axiosRef.post(
        this.HTTP_INTERCEPTOR_URL,
        data,
        { timeout: this.HTTP_INTERCEPTOR_TIMEOUT },
      )
      return response.data
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        this.logger.error('Request timed out!')
      } else {
        this.logger.error(error)
      }
      return { action: HttpInterceptorAction.ALLOW }
    }
  }
}
