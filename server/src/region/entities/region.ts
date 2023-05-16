import { ObjectId } from 'mongodb'

export type RegionClusterConf = {
  driver: string
  kubeconfig: string | null
  npmInstallFlags: string
}

export type RegionDatabaseConf = {
  driver: string
  connectionUri: string
  controlConnectionUri: string
}

export type RegionGatewayConf = {
  driver: string
  runtimeDomain: string
  websiteDomain: string
  port: number
  apiUrl: string
  apiKey: string
}

export type RegionStorageConf = {
  driver: string
  domain: string
  externalEndpoint: string
  internalEndpoint: string
  accessKey: string
  secretKey: string
  controlEndpoint: string
}

export class Region {
  _id?: ObjectId
  name: string
  displayName: string
  clusterConf: RegionClusterConf
  databaseConf: RegionDatabaseConf
  gatewayConf: RegionGatewayConf
  storageConf: RegionStorageConf
  tls: boolean
  state: string
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<Region>) {
    Object.assign(this, partial)
  }
}
