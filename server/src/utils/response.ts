export class ResponseUtil {
  static ok(data: any) {
    return new ResponseUtil(data, null)
  }

  static error(error: string) {
    return new ResponseUtil(null, error)
  }

  static build(data: any, error: string) {
    return new ResponseUtil(data, error)
  }

  constructor(public data: any, public error: string) {}
  valueOf() {
    return this.toJSON()
  }

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
