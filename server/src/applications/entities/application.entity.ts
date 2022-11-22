import { KubernetesObject, V1ObjectMeta } from '@kubernetes/client-node'

export class Application {
  static readonly Group = 'application.laf.dev'
  static readonly Version = 'v1'
  static readonly PluralName = 'applications'
  static readonly Kind = 'Application'
  static get GroupVersion() {
    return `${Application.Group}/${Application.Version}`
  }

  static create(name: string, namespace: string, spec?: IApplicationSpec) {
    const data: IApplication = {
      apiVersion: Application.GroupVersion,
      kind: Application.Kind,
      metadata: new V1ObjectMeta(),
      spec: spec,
    }
    data.metadata.name = name
    data.metadata.namespace = namespace
    return data
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

export interface IApplication extends KubernetesObject {
  spec: IApplicationSpec
  status?: IApplicationStatus
}

export interface IApplicationSpec {
  appid: string
  state: ApplicationState
  region: string
  bundleName: string
  runtimeName: string
}

export interface IApplicationStatus {
  state?: ApplicationState
}

export interface IApplicationList {
  apiVersion: string
  items: IApplication[]
}
