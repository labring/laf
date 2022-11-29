import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty } from '@nestjs/swagger'
import { GroupVersionKind, ObjectMeta } from '../../core/kubernetes.interface'

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
  apiVersion: string

  @ApiProperty()
  kind: string

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: RuntimeSpec

  static readonly GVK = new GroupVersionKind(
    'runtime.laf.dev',
    'v1',
    'Runtime',
    'runtimes',
  )

  constructor(name: string, namespace: string) {
    this.apiVersion = Runtime.GVK.apiVersion
    this.kind = Runtime.GVK.kind
    this.metadata = new ObjectMeta(name, namespace)
    this.metadata.labels = {}
    this.spec = new RuntimeSpec()
  }

  static fromObject(obj: KubernetesObject) {
    const runtime = new Runtime(obj.metadata?.name, obj.metadata?.namespace)
    delete obj.metadata
    Object.assign(runtime, obj)
    return runtime
  }
}
export class RuntimeList {
  @ApiProperty()
  apiVersion: string

  @ApiProperty({
    type: [Runtime],
  })
  items: Runtime[]

  static fromObject(obj: KubernetesListObject<Runtime>) {
    const list = new RuntimeList()
    Object.assign(list, obj)
    list.items = obj.items.map((item) => Runtime.fromObject(item))
    return list
  }
}
