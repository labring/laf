export enum HttpInterceptorAction {
  ALLOW = 'allow',
  DENY = 'deny',
}
class HttpInterceptorRewrite {
  status: number
  data: any
}
export class HttpInterceptorResponseDto {
  action: HttpInterceptorAction
  rewrite?: HttpInterceptorRewrite
  redirect?: string
}
