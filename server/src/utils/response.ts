export class ResponseStruct {
  static ok(data: any) {
    return new ResponseStruct(data, null)
  }

  static error(error: string) {
    return new ResponseStruct(null, error)
  }

  static build(data: any, error: string) {
    return new ResponseStruct(data, error)
  }

  constructor(public data: any, public error: string) {}
  toJSON() {
    return {
      error: this.error,
      data: this.data,
    }
  }
  toString() {
    return JSON.stringify(this.toJSON())
  }
}
