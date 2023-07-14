export enum DataType {
  FUNCTION = 'function',
}

export class RecycleBin {
  type: DataType
  data: any
  createdAt: Date
}
