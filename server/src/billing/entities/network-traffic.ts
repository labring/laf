import { ObjectId } from 'mongodb'

export class Traffic {
  _id?: ObjectId

  timestamp: Date

  traffic_meta: TrafficMeta

  recv_bytes: number

  sent_bytes: number
}

export class TrafficMeta {
  pod_address: string

  pod_name: string

  pod_namespace: string

  pod_type: number

  pod_type_name: string

  traffic_tag: string
}
