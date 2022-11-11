import { KubernetesObject, V1ObjectMeta } from '@kubernetes/client-node'

export class Application implements KubernetesObject {
  apiVersion = 'application.laf.dev/v1'
  kind = 'Application'
  metadata?: V1ObjectMeta
  spec: ApplicationSpec

  constructor(name: string) {
    this.metadata = {
      name,
    }
  }

  toJSON() {
    return {
      apiVersion: this.apiVersion,
      kind: this.kind,
      metadata: this.metadata,
      spec: this.spec.toJSON(),
    }
  }
}

export class ApplicationSpec {
  appid: string
  state: ApplicationState
  region: string
  bundleName: string
  runtimeName: string

  constructor(data: {
    appid: string
    state: ApplicationState
    region: string
    bundleName: string
    runtimeName: string
  }) {
    this.appid = data.appid
    this.state = data.state
    this.region = data.region
    this.bundleName = data.bundleName
    this.runtimeName = data.runtimeName
  }

  toJSON() {
    return {
      appid: this.appid,
      state: this.state,
      region: this.region,
      bundleName: this.bundleName,
      runtimeName: this.runtimeName,
    }
  }
}

export enum ApplicationState {
  ApplicationStateInitializing = 'Initializing',
  ApplicationStateInitialized = 'Initialized',
  ApplicationStateStarting = 'Starting',
  ApplicationStateRunning = 'Running',
  ApplicationStateStopping = 'Stopping',
  ApplicationStateStopped = 'Stopped',
}
