import { KubernetesObject } from '@kubernetes/client-node'

export interface IRuntime extends KubernetesObject {
  spec: IRuntimeSpec
}

export interface IRuntimeSpec {
  // type of the runtime. eg. node:laf, node:tcb, go:laf, python:laf, php:laf,  etc.
  type: string

  image: IRuntimeImageGroup

  version: IRuntimeVersion
}

export interface IRuntimeVersion {
  version: string
}

export interface IRuntimeImageGroup {
  main: string
  sidecar: string
  init: string
}

export interface IRuntimeList {
  apiVersion: string
  items: IRuntime[]
}
