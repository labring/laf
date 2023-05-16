import { ObjectId } from 'mongodb'

export type RuntimeImageGroup = {
  main: string
  init: string | null
  sidecar: string | null
}

export class Runtime {
  _id?: ObjectId
  name: string
  type: string
  image: RuntimeImageGroup
  state: string
  version: string
  latest: boolean

  constructor(partial: Partial<Runtime>) {
    Object.assign(this, partial)
  }
}
