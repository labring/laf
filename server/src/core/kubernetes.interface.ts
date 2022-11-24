import { V1ObjectMeta } from '@kubernetes/client-node'
import { ApiProperty } from '@nestjs/swagger'

export enum ConditionStatus {
  ConditionTrue = 'True',
  ConditionFalse = 'False',
  ConditionUnknown = 'Unknown',
}

export class ObjectMeta implements V1ObjectMeta {
  /**
   * Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. More info: http://kubernetes.io/docs/user-guide/identifiers#names
   */
  @ApiProperty()
  name: string

  /**
   * Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the \"default\" namespace, but \"default\" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty.  Must be a DNS_LABEL. Cannot be updated. More info: http://kubernetes.io/docs/user-guide/namespaces
   */
  @ApiProperty()
  namespace: string

  /**
   * Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. More info: http://kubernetes.io/docs/user-guide/labels
   */
  @ApiProperty({
    required: false,
    type: Object,
  })
  labels?: {
    [key: string]: string
  }

  constructor(name?: string, namespace?: string) {
    this.name = name
    this.namespace = namespace
  }
}

export class Condition {
  @ApiProperty()
  type: string

  @ApiProperty({
    enum: ConditionStatus,
  })
  status: ConditionStatus

  @ApiProperty()
  reason?: string

  @ApiProperty()
  message?: string
}
