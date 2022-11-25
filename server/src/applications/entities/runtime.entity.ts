import { KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty } from '@nestjs/swagger'
import { ObjectMeta } from '../../core/kubernetes.interface'

export class RuntimeVersion {
  @ApiProperty()
  version: string
}

export class RuntimeImageGroup {
  @ApiProperty()
  main: string

  @ApiProperty()
  sidecar: string

  @ApiProperty()
  init: string
}

export class RuntimeSpec {
  // type of the runtime. eg. node:laf, node:tcb, go:laf, python:laf, php:laf,  etc.
  @ApiProperty()
  type: string

  @ApiProperty()
  image: RuntimeImageGroup

  @ApiProperty()
  version: RuntimeVersion
}
export class Runtime implements KubernetesObject {
  @ApiProperty()
  get apiVersion(): string {
    return Runtime.GroupVersion
  }

  @ApiProperty()
  get kind(): string {
    return Runtime.Kind
  }

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: RuntimeSpec

  static readonly Group = 'runtime.laf.dev'
  static readonly Version = 'v1'
  static readonly PluralName = 'runtimes'
  static readonly Kind = 'Runtime'
  static get GroupVersion() {
    return `${this.Group}/${this.Version}`
  }

  constructor(name: string, namespace: string) {
    this.metadata = {
      name,
      namespace,
    }
    this.spec = new RuntimeSpec()
  }
}
export class RuntimeList {
  @ApiProperty()
  apiVersion: string

  @ApiProperty({
    type: [Runtime],
  })
  items: Runtime[]
}
