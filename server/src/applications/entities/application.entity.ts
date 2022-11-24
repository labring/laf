import { KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Condition, ObjectMeta } from '../../core/kubernetes.interface'
import { BundleSpec } from './bundle.entity'
import { RuntimeSpec } from './runtime.entity'

export enum ApplicationState {
  ApplicationStateInitializing = 'Initializing',
  ApplicationStateInitialized = 'Initialized',
  ApplicationStateStarting = 'Starting',
  ApplicationStateRunning = 'Running',
  ApplicationStateStopping = 'Stopping',
  ApplicationStateStopped = 'Stopped',
}
export class ApplicationSpec {
  @ApiProperty()
  appid: string

  @ApiProperty()
  state: ApplicationState

  @ApiProperty()
  region: string

  @ApiProperty()
  bundleName: string

  @ApiProperty()
  runtimeName: string

  constructor({
    appid = '',
    state = ApplicationState.ApplicationStateInitializing,
    region = '',
    bundleName = '',
    runtimeName = '',
  } = {}) {
    this.appid = appid
    this.state = state
    this.region = region
    this.bundleName = bundleName
    this.runtimeName = runtimeName
  }
}

export class ApplicationStatus {
  @ApiPropertyOptional()
  bundleName: string

  @ApiPropertyOptional()
  bundleSpec: BundleSpec

  @ApiPropertyOptional()
  runtimeName: string

  @ApiPropertyOptional()
  runtimeSpec: RuntimeSpec

  @ApiPropertyOptional({
    enum: ApplicationState,
  })
  phase: ApplicationState

  @ApiPropertyOptional({
    type: [Condition],
  })
  conditions: Condition[]
}

export class Application implements KubernetesObject {
  @ApiProperty()
  apiVersion: string

  @ApiProperty()
  kind: string

  @ApiProperty()
  metadata: ObjectMeta

  @ApiProperty()
  spec: ApplicationSpec

  @ApiPropertyOptional()
  status?: ApplicationStatus

  static readonly Group = 'application.laf.dev'
  static readonly Version = 'v1'
  static readonly PluralName = 'applications'
  static readonly Kind = 'Application'
  static get GroupVersion() {
    return `${this.Group}/${this.Version}`
  }

  constructor(name: string, namespace: string) {
    this.apiVersion = Application.GroupVersion
    this.kind = Application.Kind
    this.metadata = {
      name,
      namespace,
    }
    this.spec = new ApplicationSpec()
  }
}
export class ApplicationList {
  @ApiProperty()
  apiVersion: string

  @ApiProperty({
    type: [Application],
  })
  items: Application[]
}
