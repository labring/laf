import { ObjectId } from 'mongodb'

export type RuntimeImageGroup = {
  main: string
  init: string
  sidecar?: string
}

export class Runtime {
  _id?: ObjectId
  name: string
  type: string
  image: RuntimeImageGroup
  state: 'Active' | 'Inactive'
  version: string
  latest: boolean

  constructor(partial: Partial<Runtime>) {
    Object.assign(this, partial)
  }
}
