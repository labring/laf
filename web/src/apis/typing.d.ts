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
  region: Region;
  bundle: Bundle;
  runtime: Runtime;
  configuration: Configuration;
  gateway: Gateway;
  database: Database;
  oss: Oss;
  function_debug_token: string;
}

export interface Region {
  id: string;
  name: string;
  desc: any;
}

export interface Bundle {
  id: string;
  name: string;
  displayName: string;
  limitCPU: number;
  limitMemory: number;
  requestCPU: number;
  requestMemory: number;
  databaseCapacity: number;
  storageCapacity: number;
  networkTrafficOutbound: number;
  networkTrafficInbound: any;
  priority: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  name: string;
  value: string;
}

export interface Gateway {
  apiVersion: string;
  kind: string;
  metadata: Metadata;
  spec: Spec;
  status: Status;
}

export interface Metadata {
  creationTimestamp: string;
  generation: number;
  labels: Labels;
  name: string;
  namespace: string;
  resourceVersion: string;
  uid: string;
}

export interface Labels {
  "laf.dev/appid": string;
}

export interface Spec {
  appid: string;
  buckets: string[];
}

export interface Status {
  appRoute: AppRoute;
  bucketRoutes: BucketRoutes;
  conditions: Condition[];
}

export interface AppRoute {
  domain: string;
  domainName: string;
  domainNamespace: string;
}

export interface BucketRoutes {
  "ymactc-site": YmactcSite;
}

export interface YmactcSite {
  domain: string;
  domainName: string;
  domainNamespace: string;
}

export interface Condition {
  lastTransitionTime: string;
  message: string;
  reason: string;
  status: string;
  type: string;
}

export interface Database {
  apiVersion: string;
  kind: string;
  metadata: Metadata2;
  spec: Spec2;
  status: Status2;
}

export interface Metadata2 {
  creationTimestamp: string;
  finalizers: string[];
  generation: number;
  labels: Labels2;
  name: string;
  namespace: string;
  resourceVersion: string;
  uid: string;
}

export interface Labels2 {
  "laf.dev/appid": string;
  "laf.dev/database.store.name": string;
  "laf.dev/database.store.namespace": string;
}

export interface Spec2 {
  capacity: Capacity;
  password: string;
  provider: string;
  region: string;
  username: string;
}

export interface Capacity {
  storage: string;
}

export interface Status2 {
  capacity: Capacity2;
  conditions: Condition2[];
  connectionUri: string;
  storeName: string;
  storeNamespace: string;
}

export interface Capacity2 {
  storage: string;
}

export interface Condition2 {
  lastTransitionTime: string;
  message: string;
  reason: string;
  status: string;
  type: string;
}

export interface Oss {
  apiVersion: string;
  kind: string;
  metadata: Metadata3;
  spec: Spec3;
  status: Status3;
  credentials: Credentials;
}

export interface Metadata3 {
  creationTimestamp: string;
  finalizers: string[];
  generation: number;
  labels: Labels3;
  name: string;
  namespace: string;
  resourceVersion: string;
  uid: string;
}

export interface Labels3 {
  "laf.dev/appid": string;
  "laf.dev/oss.store.name": string;
  "laf.dev/oss.store.namespace": string;
}

export interface Spec3 {
  appid: string;
  capacity: Capacity3;
  password: string;
  provider: string;
  region: string;
}

export interface Capacity3 {
  bucketCount: number;
  objectCount: number;
  storage: string;
}

export interface Status3 {
  accessKey: string;
  capacity: Capacity4;
  conditions: Condition3[];
  endpoint: string;
  region: string;
  secretKey: string;
  storeName: string;
  storeNamespace: string;
}

export interface Capacity4 {
  bucketCount: number;
  objectCount: number;
  storage: string;
}

export interface Condition3 {
  lastTransitionTime: string;
  message: string;
  reason: string;
  status: string;
  type: string;
}

export interface Credentials {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: string;
}

export interface TBucket {
  apiVersion: string;
  kind: string;
  metadata: Metadata;
  spec: Spec;
  status: Status;
}

export interface Metadata {
  creationTimestamp: string;
  finalizers: string[];
  generation: number;
  name: string;
  namespace: string;
  resourceVersion: string;
  uid: string;
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
