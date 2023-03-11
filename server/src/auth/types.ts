export enum AuthBindingType {
  Required = 'required',
  Optional = 'optional',
  None = 'none',
}

export interface AuthProviderBinding {
  phone: AuthBindingType
  email: AuthBindingType
  github: AuthBindingType
  wechat: AuthBindingType
}

export interface AlismsConfig {
  accessKeyId: string
  accessKeySecret: string
  endpoint: string
  signName: string
  templateCode: string
}