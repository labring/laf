import { KubernetesObject } from '@kubernetes/client-node'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ResourceLabels } from '../../constants'
import {
  Condition,
  GroupVersionKind,
  ObjectMeta,
} from '../../core/kubernetes.interface'
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

  static readonly GVK = new GroupVersionKind(
    'application.laf.dev',
    'v1',
    'Application',
    'applications',
  )

  constructor(name: string, namespace: string) {
    this.apiVersion = Application.GVK.apiVersion
    this.kind = Application.GVK.kind
    this.metadata = new ObjectMeta(name, namespace)
    this.metadata.labels = {}
    this.spec = new ApplicationSpec()
  }

  setUserId(userid: string) {
    this.metadata.labels = {
      ...this.metadata.labels,
      [ResourceLabels.USER_ID]: userid,
    }
  }

  get userid() {
    return this.metadata.labels?.[ResourceLabels.USER_ID]
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
