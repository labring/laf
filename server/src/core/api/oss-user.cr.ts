import { KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Condition, GroupVersionKind, ObjectMeta } from './types'

export class OSSUserCapacity {
  @ApiProperty()
  storage: string

  @ApiProperty()
  objectCount: number

  @ApiProperty()
  bucketCount: number

  constructor() {
    this.objectCount = 0
    this.bucketCount = 0
  }
}

export class OSSUserSpec {
  @ApiProperty()
  appid: string

  @ApiProperty()
  region: string

  @ApiProperty()
  password: string

  @ApiProperty()
  provider: string

  @ApiProperty()
  capacity: OSSUserCapacity

  constructor() {
    this.provider = 'minio'
    this.capacity = new OSSUserCapacity()
  }
}

export class OSSUserStatus {
  @ApiProperty()
  storeName: string

  @ApiProperty()
  storeNamespace: string

  @ApiProperty()
  accessKey: string

  @ApiProperty()
  secretKey: string

  @ApiProperty()
  endpoint: string

  @ApiProperty()
  region: string

  @ApiProperty()
  capacity: OSSUserCapacity

  @ApiProperty()
  conditions: Condition[]
}

export class OSSUser implements KubernetesObject {
  @ApiProperty()
  apiVersion: string

  @ApiProperty()
  kind: string

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: OSSUserSpec

  @ApiPropertyOptional()
  status?: OSSUserStatus

  static readonly GVK = new GroupVersionKind(
    'oss.laf.dev',
    'v1',
    'User',
    'users',
  )

  constructor(name: string, namespace: string) {
    this.apiVersion = OSSUser.GVK.apiVersion
    this.kind = OSSUser.GVK.kind
    this.metadata = new ObjectMeta(name, namespace)
    this.spec = new OSSUserSpec()
  }

  static fromObject(obj: KubernetesObject): OSSUser {
    const user = new OSSUser(obj.metadata.name, obj.metadata.namespace)
    delete obj.metadata['managedFields']
    Object.assign(user, obj)
    return user
  }
}
