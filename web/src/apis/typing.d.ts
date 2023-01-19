export interface TApplication {
  id: string;
  name: string;
  appid: string;
  regionName: string;
  bundleName: string;
  runtimeName: string;
  state: string;
  phase: string;
  tags: any[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  bundle: Bundle;
  runtime: Runtime;
  configuration: Configuration;
  domain: Domain;
  storage: Storage;
  function_debug_token: string;
}

export interface Bundle {
  id: string;
  name: string;
  displayName: string;
  regionName: string;
  limitCPU: number;
  limitMemory: number;
  requestCPU: number;
  requestMemory: number;
  databaseCapacity: number;
  storageCapacity: number;
  networkTrafficOutbound: number;
  priority: number;
  state: string;
  price: number;
}

export interface Runtime {
  id: string;
  name: string;
  type: string;
  image: Image;
  version: string;
  latest: boolean;
}

export interface Image {
  main: string;
  init: string;
  sidecar: any;
}

export interface Configuration {
  id: string;
  appid: string;
  environments: Environment[];
  dependencies: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  name: string;
  value: string;
}

export interface Domain {
  id: string;
  appid: string;
  domain: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface Storage {
  id: string;
  appid: string;
  accessKey: string;
  secretKey: string;
  createdAt: string;
  updatedAt: string;
  credentials: Credentials;
}

export interface Credentials {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
}

export interface TBucket {
  id: string;
  appid: string;
  name: string;
  shortName: string;
  policy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Spec {
  policy: string;
  storage: string;
}

export interface Status {
  capacity: Capacity;
  conditions: Condition[];
  policy: string;
  user: string;
  versioning: boolean;
}

export interface Capacity {
  maxStorage: string;
  objectCount: number;
  storage: string;
}

export interface Condition {
  lastTransitionTime: string;
  message: string;
  reason: string;
  status: string;
  type: string;
}

export interface TDB {
  name: string;
  type: string;
  options: Options;
  info: Info;
  idIndex: IdIndex;
}

export interface Options {}

export interface Info {
  readOnly: boolean;
  uuid: string;
}

export interface IdIndex {
  v: number;
  key: Key;
  name: string;
}

export interface Key {
  _id: number;
}

export interface TFunction {
  id: string;
  appid: string;
  name: string;
  source: Source;
  desc: string;
  tags: any[];
  websocket: boolean;
  methods: TMethod[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type TMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";

export interface Source {
  code: string;
  compiled: string;
  uri: any;
  version: number;
  hash: any;
  lang: any;
}

export interface TLogItem {
  _id: string;
  request_id: string;
  func: string;
  data: string;
  created_at: string;
}

// user data
export interface TUserInfo {
  id: string;
  username: string;
  email: any;
  phone: any;
  createdAt: string;
  updatedAt: string;
  profile: TProfile;
}

export interface TProfile {
  id: string;
  uid: string;
  openid: string;
  from: string;
  avatar: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
