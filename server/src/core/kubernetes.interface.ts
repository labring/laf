export enum ConditionStatus {
  ConditionTrue = 'True',
  ConditionFalse = 'False',
  ConditionUnknown = 'Unknown',
}

export interface Condition {
  type: string
  status: ConditionStatus
  reason?: string
  message?: string
}
