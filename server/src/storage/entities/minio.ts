export class MinioUser {
  accessKey: string
  policyName: string
  userStatus: 'enabled' | 'disabled'
  memberOf: {
    name: string
    policies: string[]
  }[]
}
