import { HttpService } from '@nestjs/axios'
import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { HTTP_INTERCEPTOR_TIMEOUT, ServerConfig } from 'src/constants'
import { HttpInterceptorAction } from './dto/http-interceptor.dto'
import { Response } from 'express'
import { Request } from 'express'

@Injectable()
export class HttpInterceptorService {
  constructor(private httpService: HttpService) {}

  private readonly logger = new Logger(HttpInterceptorService.name)
  private readonly HTTP_INTERCEPTOR_URL = ServerConfig.HTTP_INTERCEPTOR_URL
  private readonly HTTP_INTERCEPTOR_TIMEOUT = HTTP_INTERCEPTOR_TIMEOUT

  async processPreInterceptor(context: ExecutionContext, requestId: string) {
    const requestData = this.buildRequestData(context, requestId)
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

  buildRequestData(context: ExecutionContext, requestId: string) {
    const request: Request = context.switchToHttp().getRequest()
    return {
      url: request.url,
      method: request.method,
      headers: request.headers,
      user: request.user,
      params: request.params,
      query: request.query,
      body: request.body,
      id: requestId,
      controller: context.getClass().name,
      handler: context.getHandler().name,
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
    if (!this.HTTP_INTERCEPTOR_URL) {
      return { action: HttpInterceptorAction.ALLOW }
    }
    try {
      const response = await this.httpService.axiosRef.post(
        this.HTTP_INTERCEPTOR_URL,
        data,
        { timeout: this.HTTP_INTERCEPTOR_TIMEOUT },
      )
      if (!response.data) {
        return {
          action: HttpInterceptorAction.ALLOW,
        }
      }
      if (!response.data.action) {
        return {
          action: HttpInterceptorAction.ALLOW,
        }
      }
      return response.data
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        this.logger.error('Request timeout!')
      } else {
        this.logger.error(error)
      }
      return { action: HttpInterceptorAction.ALLOW }
    }
  }
}
