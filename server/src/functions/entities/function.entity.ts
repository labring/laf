import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { GroupVersionKind, ObjectMeta } from '../../core/kubernetes.interface'

export class CloudFunctionSource {
  @ApiProperty()
  codes: string

  @ApiProperty()
  uri?: string

  @ApiProperty()
  version: number

  constructor() {
    this.version = 0
  }
}

export class CloudFunctionSpec {
  @ApiProperty()
  description: string

  @ApiProperty()
  websocket: boolean

  @ApiProperty()
  methods: string[]

  @ApiProperty()
  source: CloudFunctionSource

  constructor() {
    this.source = new CloudFunctionSource()
  }
}

export enum CloudFunctionState {
  Deployed = 'Deployed',
}

export class CloudFunctionStatus {
  @ApiProperty({
    enum: CloudFunctionState,
  })
  state: CloudFunctionState
}

export class CloudFunction implements KubernetesObject {
  @ApiProperty()
  apiVersion: string

  @ApiProperty()
  kind: string

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: CloudFunctionSpec

  @ApiPropertyOptional()
  status?: CloudFunctionStatus

  static readonly GVK = new GroupVersionKind(
    'runtime.laf.dev',
    'v1',
    'Function',
    'functions',
  )

  constructor(name: string, namespace: string) {
    this.apiVersion = CloudFunction.GVK.apiVersion
    this.kind = CloudFunction.GVK.kind
    this.metadata = {
      name,
      namespace,
    }
    this.spec = new CloudFunctionSpec()
  }
}

export class CloudFunctionList implements KubernetesListObject<CloudFunction> {
  @ApiProperty()
  apiVersion?: string

  @ApiProperty()
  kind?: string = 'FunctionList'

  @ApiProperty({
    type: [CloudFunction],
  })
  items: CloudFunction[]
}
