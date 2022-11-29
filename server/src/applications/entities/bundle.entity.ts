import { KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty } from '@nestjs/swagger'
import { ObjectMeta } from '../../core/kubernetes.interface'

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
  get apiVersion(): string {
    return Bundle.GroupVersion
  }

  @ApiProperty()
  get kind(): string {
    return Bundle.Kind
  }

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: BundleSpec

  static readonly Group = 'application.laf.dev'
  static readonly Version = 'v1'
  static readonly PluralName = 'bundles'
  static readonly Kind = 'Bundle'
  static get GroupVersion() {
    return `${this.Group}/${this.Version}`
  }

  constructor(name: string, namespace: string) {
    this.metadata = {
      name,
      namespace,
    }
    this.spec = new BundleSpec()
  }
}

export class BundleList {
  @ApiProperty()
  apiVersion: string

  @ApiProperty({
    type: [Bundle],
  })
  items: Bundle[]
}
