export type TApplication = {
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
  bundle: TBundle;
  runtime: Runtime;
  configuration: Configuration;
  domain: Domain;
  storage: Storage;
  tls: boolean;
  develop_token: string;
  port: number;
  host: string;
};

export type TBundle = {
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
};

export type Runtime = {
  id: string;
  name: string;
  type: string;
  image: Image;
  version: string;
  latest: boolean;
};

export type Image = {
  main: string;
  init: string;
  sidecar: any;
};

export type Configuration = {
  id: string;
  appid: string;
  environments: Environment[];
  dependencies: any[];
  createdAt: string;
  updatedAt: string;
};

export type Environment = {
  name: string;
  value: string;
};

export type Domain = {
  id: string;
  appid: string;
  bucketName: string;
  domain: string;
  state: string;
  phase: string;
  createdAt: string;
  updatedAt: string;
  lockedAt: string;
};

export type Storage = {
  id: string;
  appid: string;
  accessKey: string;
  secretKey: string;
  createdAt: string;
  updatedAt: string;
  credentials: Credentials;
};

export type Credentials = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
};

export type TBucket = {
  id: string;
  appid: string;
  name: string;
  shortName: string;
  policy: string;
  state: string;
  phase: string;
  lockedAt: string;
  createdAt: string;
  updatedAt: string;
  domain: Domain;
  websiteHosting: TWebsiteHosting;
};

export type TWebsiteHosting = {
  id: string;
  appid: string;
  bucketName: string;
  domain: string;
  isCustom: boolean;
  state: string;
  phase: string;
  createdAt: string;
  updatedAt: string;
  lockedAt: string;
};

export type Spec = {
  policy: string;
  storage: string;
};

export type Status = {
  capacity: Capacity;
  conditions: Condition[];
  policy: string;
  user: string;
  versioning: boolean;
};

export type Capacity = {
  maxStorage: string;
  objectCount: number;
  storage: string;
};

export type Condition = {
  lastTransitionTime: string;
  message: string;
  reason: string;
  status: string;
  type: string;
};

export type TDB = {
  name: string;
  type: string;
  options: Options;
  info: Info;
  idIndex: IdIndex;
};

export type Options = {};

export type Info = {
  readOnly: boolean;
  uuid: string;
};

export type IdIndex = {
  v: number;
  key: Key;
  name: string;
};

export type Key = {
  _id: number;
};

export type TFunction = {
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
};

export type TMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";

export type Source = {
  code: string;
  compiled: string;
  uri: any;
  version: number;
  hash: any;
  lang: any;
};

export type TLogItem = {
  _id: string;
  request_id: string;
  func: string;
  data: string;
  created_at: string;
};

// user data
export type TUserInfo = {
  id: string;
  username: string;
  email: any;
  phone: any;
  createdAt: string;
  updatedAt: string;
  profile: TProfile;
};

export type TProfile = {
  id: string;
  uid: string;
  openid: string;
  from: string;
  avatar: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};
