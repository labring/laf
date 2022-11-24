import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectMeta } from 'src/core/kubernetes.interface'

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

  static readonly Group = 'runtime.laf.dev'
  static readonly Version = 'v1'
  static readonly PluralName = 'functions'
  static readonly Kind = 'Function'
  static get GroupVersion() {
    return `${this.Group}/${this.Version}`
  }

  constructor(name: string, namespace: string) {
    this.apiVersion = CloudFunction.GroupVersion
    this.kind = CloudFunction.Kind
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
