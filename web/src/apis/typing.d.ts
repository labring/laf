export type TApplicationDetail = {
  _id: string;
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
  bundle: TCurrentBundle;
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
};

export type TCurrentBundle = {
  _id: string;
  appid: string;
  bundleId: string;
  name: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  resource: TResource;
};

export type TBundle = {
  _id: string;
  regionId: string;
  message?: string;
  name: string;
  displayName: string;
  spec: TSpec;
  enableFreeTier: boolean;
  limitCountOfFreeTierPerUser: number;
  createdAt: string;
  updatedAt: string;
};

export type TInstantMonitorData = {
  cpuUsage: TDatabaseUsage;
  memoryUsage: TDatabaseUsage;
  databaseUsage: TDatabaseUsage;
  storageUsage: TDatabaseUsage;
};

export type TCpuUsageData = {
  metric: { pod: string };
  values: Array<[number, string]>;
}[];

export type TDatabaseUsage = {
  metric: { pod: string };
  value: [number, string];
}[];

export type TSpec = {
  cpu: Cpu;
  memory: Memory;
  databaseCapacity: DatabaseCapacity;
  storageCapacity: StorageCapacity;
  networkTraffic: NetworkTraffic;
  dedicatedDatabaseCPU: Cpu;
  dedicatedDatabaseMemory: Memory;
  dedicatedDatabaseCapacity: DatabaseCapacity;
  dedicatedDatabaseReplicas: Replicas;
};

export type Cpu = {
  value: number;
};

export type Memory = {
  value: number;
};

export type DatabaseCapacity = {
  value: number;
};

export type StorageCapacity = {
  value: number;
};

export type NetworkTraffic = {
  value: number;
};

export type Replicas = {
  value: number;
};

export type TResource = {
  limitCPU: number;
  limitMemory: number;
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
  _id: string;
  name: string;
  type: string;
  state: string;
  version: string;
  latest: boolean;
  image: TImage;
};

export type TImage = {
  main: string;
  init: string;
  sidecar: any;
};

export type TConfiguration = {
  _id: string;
  appid: string;
  dependencies: any[];
  createdAt: string;
  updatedAt: string;
  environments: TEnvironment[];
};

export type TEnvironment = {
  name: string;
  value: string;
};

export type TDomain = {
  _id: string;
  appid: string;
  domain: string;
  customDomain: string;
  state: string;
  phase: string;
  lockedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TStorage = {
  credentials: TCredentials;
  _id: string;
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
  _id: string;
  name: string;
  displayName: string;
  state: string;
  bundles: TBundle[];
  dedicatedDatabase: boolean;
};

export type TBucket = {
  _id: string;
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
  _id: string;
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

export type TSetting = {
  _id: string;
  key: string;
  value: string;
  desc: string;
  metadata: any;
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
  _id: string;
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
  params: any;
};

export type TFunctionNode = {
  _id: string;
  name: string;
  level?: number;
  isExpanded?: boolean;
  desc?: string;
  children: TreeNode[];
};

export type TFunctionList = {
  list: TFunction[];
  total: number;
  page: number;
  pageSize: number;
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

export type TFunctionTemplate = {
  _id: string;
  name: string;
  description: string;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  star: number;
  items: { name: string; source: { code: string } }[];
  dependencies: string[];
  environments: { name: string; value: string }[];
  uid: string;
  user: { username: string };
  author: string;
  stared: boolean;
  isRecommended: boolean;
};

export type TemplateList = {
  list: TFunctionTemplate[];
  total: number;
  page: number;
  pageSize: number;
};

export type TLogItem = {
  _id: string;
  request_id: string;
  func: string;
  data: string;
  created_at: string;
};

export type TApplicationItem = {
  _id: string;
  appid: string;
  name: string;
  state: string;
  phase: string;
  tags: Array<any>;
  createdBy: string;
  lockedAt: string;
  regionId: string;
  runtimeId: string;
  billingLockedAt: string;
  createdAt: string;
  updatedAt: string;
  bundle: {
    _id: string;
    appid: string;
    resource: {
      limitCPU: number;
      limitMemory: number;
      databaseCapacity: number;
      storageCapacity: number;
      limitCountOfCloudFunction: number;
      limitCountOfBucket: number;
      limitCountOfDatabasePolicy: number;
      limitCountOfTrigger: number;
      limitCountOfWebsiteHosting: number;
      limitDatabaseTPS: number;
      limitStorageTPS: number;
      reservedTimeAfterExpired: number;
      dedicatedDatabase: {
        limitCPU: number;
        limitMemory: number;
        capacity: number;
        replicas: number;
      };
    };
    autoscaling: {
      enable: boolean;
      minReplicas: number;
      maxReplicas: number;
      targetCPUUtilizationPercentage: number | null;
      targetMemoryUtilizationPercentage: number | null;
    };
    createdAt: string;
    updatedAt: string;
  };
  runtime: {
    _id: string;
    name: string;
    type: string;
    state: string;
    version: string;
    latest: boolean;
    image: {
      main: string;
      init: string;
    };
  };
};

export type TSmsCode = "Signin" | "Signup" | "ResetPassword" | "Bind" | "Unbind" | "ChangePhone";
