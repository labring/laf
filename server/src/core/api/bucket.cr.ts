import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Condition, GroupVersionKind, ObjectMeta } from './types'

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

  static readonly GVK = new GroupVersionKind(
    'oss.laf.dev',
    'v1',
    'Bucket',
    'buckets',
  )

  constructor(name: string, namespace: string) {
    this.apiVersion = Bucket.GVK.apiVersion
    this.kind = Bucket.GVK.kind
    this.metadata = new ObjectMeta(name, namespace)
    this.spec = new BucketSpec()
  }

  static fromObject(obj: KubernetesObject): Bucket {
    const bucket = new Bucket(obj.metadata.name, obj.metadata.namespace)
    delete obj.metadata['managedFields']
    Object.assign(bucket, obj)
    return bucket
  }
}

export class BucketList {
  @ApiProperty()
  apiVersion: string

  @ApiProperty({
    type: [Bucket],
  })
  items: Bucket[]

  static fromObject(obj: KubernetesListObject<Bucket>): BucketList {
    const list = new BucketList()
    Object.assign(list, obj)
    list.items = obj.items.map((item) => Bucket.fromObject(item))
    return list
  }
}
