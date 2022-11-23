import { KubernetesObject } from '@kubernetes/client-node'

export interface IBundle extends KubernetesObject {
  spec: IBundleSpec
}

export interface IBundleSpec {
  displayName: string

  requestCPU: string
  requestMemory: string
  limitCPU: string
  limitMemory: string

  databaseCapacity: string
  storageCapacity: string

  networkBandwidthOutbound: string
  networkBandwidthInbound: string
  networkTrafficOutbound: string

  Priority: number
}

export interface IBundleList {
  apiVersion: string
  items: IBundle[]
}
