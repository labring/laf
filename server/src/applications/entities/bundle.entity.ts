import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty } from '@nestjs/swagger'
import { GroupVersionKind, ObjectMeta } from '../../core/kubernetes.interface'

export class BundleSpec {
  @ApiProperty()
  displayName: string

  @ApiProperty()
  requestCPU: string

  @ApiProperty()
  requestMemory: string

  @ApiProperty()
  limitCPU: string

  @ApiProperty()
  limitMemory: string

  @ApiProperty()
  databaseCapacity: string

  @ApiProperty()
  storageCapacity: string

  @ApiProperty()
  networkBandwidthOutbound: string

  @ApiProperty()
  networkBandwidthInbound: string

  @ApiProperty()
  networkTrafficOutbound: string

  @ApiProperty()
  Priority: number
}

export class Bundle implements KubernetesObject {
  @ApiProperty()
  apiVersion: string

  @ApiProperty()
  kind: string

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: BundleSpec

  static readonly GVK = new GroupVersionKind(
    'application.laf.dev',
    'v1',
    'Bundle',
    'bundles',
  )
  constructor(name: string, namespace: string) {
    this.apiVersion = Bundle.GVK.apiVersion
    this.kind = Bundle.GVK.kind
    this.metadata = new ObjectMeta(name, namespace)
    this.metadata.labels = {}
    this.spec = new BundleSpec()
  }

  static fromObject(obj: KubernetesObject) {
    const bundle = new Bundle(obj.metadata?.name, obj.metadata.namespace)
    delete obj.metadata
    Object.assign(bundle, obj)
    return bundle
  }
}

export class BundleList {
  @ApiProperty()
  apiVersion: string

  @ApiProperty({
    type: [Bundle],
  })
  items: Bundle[]

  static fromObject(obj: KubernetesListObject<Bundle>) {
    const list = new BundleList()
    Object.assign(list, obj)
    list.items = obj.items.map((item) => Bundle.fromObject(item))
    return list
  }
}
