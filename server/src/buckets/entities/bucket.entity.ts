import { KubernetesObject, V1ObjectMeta } from '@kubernetes/client-node'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Condition, ObjectMeta } from '../../core/kubernetes.interface'

export enum BucketPolicy {
  Private = 'private',
  ReadOnly = 'readonly',
  Public = 'readwrite',
}

export class BucketCapacity {
  @ApiProperty()
  maxStorage: string

  // used storage
  @ApiProperty()
  storage: string

  @ApiPropertyOptional()
  objectCount: number
}

export class BucketSpec {
  @ApiProperty({
    enum: BucketPolicy,
  })
  policy: BucketPolicy

  @ApiProperty()
  storage: string
}

export class BucketStatus {
  // username of bucket in oss
  @ApiProperty()
  user: string

  @ApiProperty({
    enum: BucketPolicy,
  })
  policy: BucketPolicy

  @ApiProperty()
  versioning: boolean

  @ApiProperty()
  capacity: BucketCapacity

  // type: Ready
  @ApiProperty({
    type: [Condition],
  })
  conditions: Condition[]
}
export class Bucket implements KubernetesObject {
  @ApiProperty()
  apiVersion: string

  @ApiProperty()
  kind: string

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: BucketSpec

  @ApiPropertyOptional()
  status?: BucketStatus

  static readonly Group = 'oss.laf.dev'
  static readonly Version = 'v1'
  static readonly PluralName = 'buckets'
  static readonly Kind = 'Bucket'
  static get GroupVersion() {
    return `${this.Group}/${this.Version}`
  }

  constructor(name: string, namespace: string) {
    this.apiVersion = Bucket.GroupVersion
    this.kind = Bucket.Kind
    this.metadata = new ObjectMeta(name, namespace)
    this.spec = new BucketSpec()
  }
}

export class BucketList {
  @ApiProperty()
  apiVersion: string

  @ApiProperty({
    type: [Bucket],
  })
  items: Bucket[]
}
