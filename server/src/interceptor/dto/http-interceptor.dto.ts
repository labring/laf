export enum HttpInterceptorAction {
  ALLOW = 'allow',
  DENY = 'deny',
}
class HttpInterceptorRewrite {
  status: number
  data: any
}
class HttpInterceptorRedirect {
  status: number
  data: string
}
export class HttpInterceptorResponseDto {
  action: HttpInterceptorAction
  rewrite?: HttpInterceptorRewrite
  redirect?: HttpInterceptorRedirect
  denyMessage?: string
}
