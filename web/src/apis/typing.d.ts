export type TApplicationDetail = {
  id: string;
  name: string;
  appid: string;
  regionId: string;
  runtimeId: string;
  tags: any[];
  state: string;
  phase: string;
  createdAt: string;
  updatedAt: string;
  lockedAt: string;
  createdBy: string;
  bundle: TBundle;
  runtime: TRuntime;
  configuration: TConfiguration;
  domain: TDomain;
  storage: TStorage;
  port: number;
  develop_token: string;
  tls: boolean;
  function_debug_token: string;
  host?: string;
  origin?: string;
  subscription: TSubscription;
};

export type TBundle = {
  id: string;
  name: string;
  displayName: string;
  priority: number;
  state: string;
  resource: TResource;
  limitCountPerUser: number;
  notes: { content: string }[];
  subscriptionOptions: TSubscriptionOption[];
};

export type TResource = {
  limitCPU: number;
  limitMemory: number;
  requestCPU: number;
  requestMemory: number;
  databaseCapacity: number;
  storageCapacity: number;
  networkTrafficOutbound: number;
  limitCountOfCloudFunction: number;
  limitCountOfBucket: number;
  limitCountOfDatabasePolicy: number;
  limitCountOfTrigger: number;
  limitCountOfWebsiteHosting: number;
  reservedTimeAfterExpired: number;
  limitDatabaseTPS: number;
  limitStorageTPS: number;
};

export type TSubscriptionOption = {
  name: string;
  displayName: string;
  duration: number;
  price: number;
  specialPrice: number;
};

export type TRuntime = {
  id: string;
  name: string;
  type: string;
  image: TImage;
  state: string;
  version: string;
  latest: boolean;
};

export type TImage = {
  main: string;
  init: string;
  sidecar: any;
};

export type TConfiguration = {
  id: string;
  appid: string;
  environments: TEnvironment[];
  dependencies: any[];
  createdAt: string;
  updatedAt: string;
};

export type TEnvironment = {
  name: string;
  value: string;
};

export type TDomain = {
  id: string;
  appid: string;
  domain: string;
  state: string;
  phase: string;
  lockedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TStorage = {
  credentials: TCredentials;
  id: string;
  appid: string;
  accessKey: string;
  secretKey: string;
  state: string;
  phase: string;
  lockedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TCredentials = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
};

export type TRegion = {
  id: string;
  name: string;
  displayName: string;
  state: string;
  bundles: TBundle[];
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
  domain: TDomain;
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

export type TApplicationItem = {
  id: string;
  name: string;
  appid: string;
  regionId: string;
  runtimeId: string;
  tags: Array<any>;
  state: string;
  phase: string;
  createdAt: string;
  updatedAt: string;
  lockedAt: string;
  createdBy: string;
  bundle: {
    id: string;
    appid: string;
    bundleId: string;
    name: string;
    displayName: string;
    resource: {
      limitCPU: number;
      limitMemory: number;
      requestCPU: number;
      requestMemory: number;
      databaseCapacity: number;
      storageCapacity: number;
      networkTrafficOutbound: number;
      limitCountOfCloudFunction: number;
      limitCountOfBucket: number;
      limitCountOfDatabasePolicy: number;
      limitCountOfTrigger: number;
      limitCountOfWebsiteHosting: number;
      reservedTimeAfterExpired: number;
      limitDatabaseTPS: number;
      limitStorageTPS: number;
    };
    createdAt: string;
    updatedAt: string;
  };
  runtime: {
    id: string;
    name: string;
    type: string;
    image: {
      main: string;
      init: string;
      sidecar: any;
    };
    state: string;
    version: string;
    latest: boolean;
  };
  subscription: {
    id: string;
    input: {
      name: string;
      state: string;
      runtimeId: string;
      regionId: string;
    };
    bundleId: string;
    appid: string;
    state: string;
    phase: string;
    renewalPlan: string;
    expiredAt: string;
    lockedAt: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
};
