import { KubernetesObject, V1ObjectMeta } from '@kubernetes/client-node'
import { Condition } from '../../core/kubernetes.interface'

export class Bucket {
  static readonly Group = 'oss.laf.dev'
  static readonly Version = 'v1'
  static readonly PluralName = 'buckets'
  static readonly Kind = 'Bucket'
  static get GroupVersion() {
    return `${Bucket.Group}/${Bucket.Version}`
  }

  static create(name: string, namespace: string, spec?: IBucketSpec) {
    const data: IBucket = {
      apiVersion: Bucket.GroupVersion,
      kind: Bucket.Kind,
      metadata: new V1ObjectMeta(),
      spec: spec,
    }
    data.metadata.name = name
    data.metadata.namespace = namespace
    return data
  }
}
export enum BucketPolicy {
  Private = 'private',
  ReadOnly = 'readonly',
  Public = 'readwrite',
}

export interface IBucket extends KubernetesObject {
  spec: IBucketSpec
  status?: IBucketStatus
}

export interface IBucketSpec {
  policy: BucketPolicy
  storage: string
}

export interface IBucketStatus {
  // username of bucket in oss
  user: string
  policy: BucketPolicy
  versioning: boolean
  capacity: IBucketCapacity
  // type: Ready
  conditions: Condition[]
}

export interface IBucketCapacity {
  maxStorage: string
  // used storage
  storage: string
  objectCount: number
}

export interface IBucketList {
  apiVersion: string
  items: IBucket[]
}
