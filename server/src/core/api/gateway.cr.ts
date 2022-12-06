import { KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Condition, GroupVersionKind, ObjectMeta } from './types'

export class GatewaySpec {
  @ApiProperty()
  appid: string

  @ApiProperty()
  buckets: string[]

  @ApiProperty()
  websites: string[]
}

export class GatewayRoute {
  @ApiProperty()
  domainName: string

  @ApiProperty()
  domainNamespace: string

  @ApiProperty()
  domain: string
}

export class GatewayStatus {
  @ApiProperty()
  appRoute: GatewayRoute

  @ApiProperty()
  bucketRoutes: { [key: string]: GatewayRoute }[]

  @ApiProperty()
  websiteRoutes: { [key: string]: GatewayRoute }[]

  @ApiProperty()
  conditions: Condition[]
}

export class Gateway implements KubernetesObject {
  @ApiProperty()
  apiVersion: string

  @ApiProperty()
  kind: string

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: GatewaySpec

  @ApiPropertyOptional()
  status?: GatewayStatus

  static readonly GVK = new GroupVersionKind(
    'gateway.laf.dev',
    'v1',
    'Gateway',
    'gateways',
  )

  constructor(name: string, namespace: string) {
    this.apiVersion = Gateway.GVK.apiVersion
    this.kind = Gateway.GVK.kind
    this.metadata = new ObjectMeta(name, namespace)
    this.spec = new GatewaySpec()
  }

  static fromObject(obj: KubernetesObject): Gateway {
    const gw = new Gateway(obj.metadata.name, obj.metadata.namespace)
    delete obj.metadata['managedFields']
    Object.assign(gw, obj)
    return gw
  }
}
