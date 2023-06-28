export interface CreateFunctionDto {
  /** Function name is unique in the application */
  name: string;
  description?: string;
  methods: ("GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD")[];
  /** The source code of the function */
  code: string;
  tags?: string[];
}

export interface ResponseUtil {
  error?: string;
  data?: object;
}

export interface UpdateFunctionDto {
  description?: string;
  methods: ("GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD")[];
  /** The source code of the function */
  code: string;
  tags?: string[];
  params?: object;
}

export interface CompileFunctionDto {
  /** The source code of the function */
  code: string;
}

export interface Region {
  _id: string;
  name: string;
  displayName: string;
  tls: boolean;
  state: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ApplicationBundleResource {
  /** @example 500 */
  limitCPU: number;
  /** @example 1024 */
  limitMemory: number;
  /** @example 1024 */
  databaseCapacity: number;
  /** @example 1024 */
  storageCapacity: number;
  /** @example 100 */
  limitCountOfCloudFunction: number;
  /** @example 3 */
  limitCountOfBucket: number;
  /** @example 3 */
  limitCountOfDatabasePolicy: number;
  /** @example 1 */
  limitCountOfTrigger: number;
  /** @example 3 */
  limitCountOfWebsiteHosting: number;
  reservedTimeAfterExpired: number;
}

export interface ApplicationBundle {
  _id: string;
  appid: string;
  resource: ApplicationBundleResource;
  isTrialTier?: boolean;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface RuntimeImageGroup {
  main: string;
  init: string;
  sidecar?: string;
}

export interface Runtime {
  _id: string;
  name: string;
  type: string;
  image: RuntimeImageGroup;
  state: string;
  version: string;
  latest: boolean;
}

export interface EnvironmentVariable {
  name: string;
  value: string;
}

export interface ApplicationConfiguration {
  _id: string;
  appid: string;
  environments: EnvironmentVariable[];
  dependencies: string[];
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface RuntimeDomain {
  _id: string;
  appid: string;
  domain: string;
  state: "Active" | "Inactive" | "Deleted";
  phase: "Creating" | "Created" | "Deleting" | "Deleted";
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ApplicationWithRelations {
  _id: string;
  name: string;
  appid: string;
  regionId: string;
  runtimeId: string;
  tags: string[];
  state: "Running" | "Stopped" | "Restarting" | "Deleted";
  phase: "Creating" | "Created" | "Starting" | "Started" | "Stopping" | "Stopped" | "Deleting" | "Deleted";
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  createdBy: string;
  region?: Region;
  bundle?: ApplicationBundle;
  runtime?: Runtime;
  configuration?: ApplicationConfiguration;
  domain?: RuntimeDomain;
}

export interface CreateApplicationDto {
  /** @example 200 */
  cpu: number;
  /** @example 256 */
  memory: number;
  /** @example 2048 */
  databaseCapacity: number;
  /** @example 4096 */
  storageCapacity: number;
  name: string;
  /** @default "Running" */
  state: "Running";
  regionId: string;
  runtimeId: string;
}

export interface Application {
  _id: string;
  name: string;
  appid: string;
  regionId: string;
  runtimeId: string;
  tags: string[];
  state: "Running" | "Stopped" | "Restarting" | "Deleted";
  phase: "Creating" | "Created" | "Starting" | "Started" | "Stopping" | "Stopped" | "Deleting" | "Deleted";
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  createdBy: string;
}

export interface UpdateApplicationNameDto {
  name: string;
}

export interface UpdateApplicationStateDto {
  state: "Running" | "Stopped" | "Restarting" | "Deleted";
}

export interface UpdateApplicationBundleDto {
  /** @example 200 */
  cpu: number;
  /** @example 256 */
  memory: number;
  /** @example 2048 */
  databaseCapacity: number;
  /** @example 4096 */
  storageCapacity: number;
}

export interface CreateEnvironmentDto {
  name: string;
  value: string;
}

export interface CreateBucketDto {
  /** The short name of the bucket which not contain the appid */
  shortName: string;
  policy: "readwrite" | "readonly" | "private";
}

export interface UpdateBucketDto {
  policy: "readwrite" | "readonly" | "private";
}

export interface CreateCollectionDto {
  name: string;
}

export interface Collection {
  name: string;
  type: string;
  options: object;
  info: object;
  idIndex: object;
}

export interface UpdateCollectionDto {
  validatorSchema?: object;
  validationLevel?: string;
}

export interface DatabasePolicyRule {
  _id: string;
  appid: string;
  policyName: string;
  collectionName: string;
  value: object;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface DatabasePolicyWithRules {
  _id: string;
  appid: string;
  name: string;
  injector?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  rules: DatabasePolicyRule[];
}

export interface CreatePolicyDto {
  name: string;
}

export interface DatabasePolicy {
  _id: string;
  appid: string;
  name: string;
  injector?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface UpdatePolicyDto {
  injector: string;
}

export interface CreatePolicyRuleDto {
  collectionName: string;
  value: string;
}

export interface UpdatePolicyRuleDto {
  value: string;
}

export interface Account {
  _id: string;
  balance: number;
  state: "Active" | "Inactive";
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  createdBy: string;
}

export interface AccountChargeOrder {
  _id: string;
  accountId: string;
  amount: number;
  currency: "CNY" | "USD";
  phase: "Pending" | "Paid" | "Failed";
  channel: "Manual" | "Alipay" | "WeChat" | "Stripe" | "Paypal" | "Google";
  result: object;
  message: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  createdBy: string;
}

export interface WeChatPaymentCreateOrderResult {
  code_url: string;
}

export interface CreateChargeOrderOutDto {
  order: AccountChargeOrder;
  result: WeChatPaymentCreateOrderResult;
}

export interface CreateChargeOrderDto {
  /** @example 1000 */
  amount: number;
  /** @example "WeChat" */
  channel: string;
  /** @example "CNY" */
  currency: string;
}

export interface CreateWebsiteDto {
  bucketName: string;
  state: string;
}

export interface BindCustomDomainDto {
  domain: string;
}

export interface Pat2TokenDto {
  /**
   * PAT
   * @example "laf_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
   */
  pat: string;
}

export interface UserProfile {
  _id: string;
  uid: string;
  openData?: object;
  avatar?: string;
  name?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface UserWithProfile {
  _id: string;
  username: string;
  email?: string;
  phone?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
  profile?: UserProfile;
}

export interface PasswdSignupDto {
  /**
   * username, 3-64 characters
   * @example "laf-user"
   */
  username: string;
  /**
   * password, 8-64 characters
   * @example "laf-user-password"
   */
  password: string;
  /**
   * phone
   * @example "13805718888"
   */
  phone?: string;
  /**
   * verify code
   * @example "032456"
   */
  code?: string;
  /**
   * type
   * @example "Signup"
   */
  type?: string;
  /**
   * invite code
   * @example "iLeMi7x"
   */
  inviteCode?: string;
}

export interface PasswdSigninDto {
  /**
   * username
   * @example "laf-user"
   */
  username: string;
  /**
   * password, 8-64 characters
   * @example "laf-user-password"
   */
  password: string;
}

export interface PasswdResetDto {
  /**
   * new password, 8-64 characters
   * @example "laf-user-password"
   */
  password: string;
  /**
   * phone
   * @example "13805718888"
   */
  phone: string;
  /**
   * verify code
   * @example "032456"
   */
  code: string;
  /**
   * type
   * @example "ResetPassword"
   */
  type: string;
}

export interface PasswdCheckDto {
  /**
   * username | phone | email
   * @example "laf-user | 13805718888 | laf-user@laf.com"
   */
  username: string;
}

export interface SendPhoneCodeDto {
  /**
   * phone
   * @example "13805718888"
   */
  phone: string;
  /**
   * verify code type
   * @example "Signin | Signup | ResetPassword | Bind | Unbind | ChangePhone"
   */
  type: string;
}

export interface PhoneSigninDto {
  /**
   * phone
   * @example "13805718888"
   */
  phone: string;
  code: string;
  /**
   * username
   * @example "laf-user"
   */
  username: string;
  /**
   * password, 8-64 characters
   * @example "laf-user-password"
   */
  password: string;
  /**
   * invite code
   * @example "iLeMi7x"
   */
  inviteCode?: string;
}

export interface BindPhoneDto {
  /**
   * phone number
   * @example "13805718888"
   */
  phone: string;
  /**
   * sms verify code
   * @example "032476"
   */
  code: string;
}

export interface BindUsernameDto {
  /**
   * username
   * @example "laf-user"
   */
  username: string;
  /**
   * phone
   * @example "13805718888"
   */
  phone: string;
  /**
   * sms verify code
   * @example "032476"
   */
  code: string;
}

export interface CreatePATDto {
  name: string;
  /** @min 60 */
  expiresIn: number;
}

export interface CreateTriggerDto {
  desc: string;
  cron: string;
  target: string;
}

export interface FunctionLog {
  _id: string;
  request_id: string;
  func: string;
  data: string;
  /** @format date-time */
  created_at: string;
}

export interface CreateDependencyDto {
  name: string;
  spec: string;
}

export interface UpdateDependencyDto {
  name: string;
  spec: string;
}

export interface DeleteDependencyDto {
  name: string;
}

export interface ApplicationBillingDetailItem {
  usage: number;
  amount: number;
}

export interface ApplicationBillingDetail {
  cpu: ApplicationBillingDetailItem;
  memory: ApplicationBillingDetailItem;
  databaseCapacity: ApplicationBillingDetailItem;
  storageCapacity: ApplicationBillingDetailItem;
  networkTraffic: ApplicationBillingDetailItem;
}

export interface ApplicationBilling {
  _id: string;
  appid: string;
  state: "Pending" | "Done";
  amount: number;
  detail: ApplicationBillingDetail;
  /** @format date-time */
  startAt: string;
  /** @format date-time */
  endAt: string;
  createdBy: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CalculatePriceResultDto {
  /** @example 0.072 */
  cpu: number;
  /** @example 0.036 */
  memory: number;
  /** @example 0.036 */
  storageCapacity: number;
  /** @example 0.036 */
  databaseCapacity: number;
  /** @example 0.18 */
  total: number;
}

export interface CalculatePriceDto {
  /** @example 200 */
  cpu: number;
  /** @example 256 */
  memory: number;
  /** @example 2048 */
  databaseCapacity: number;
  /** @example 4096 */
  storageCapacity: number;
  regionId: string;
}

export interface ResourceSpec {
  value: number;
  label?: string;
}

export interface ResourceOption {
  _id: string;
  regionId: string;
  type: "cpu" | "memory" | "databaseCapacity" | "storageCapacity" | "networkTraffic";
  price: number;
  specs: ResourceSpec[];
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface ResourceBundleSpecMap {
  cpu: ResourceSpec;
  memory: ResourceSpec;
  databaseCapacity: ResourceSpec;
  storageCapacity: ResourceSpec;
  networkTraffic?: ResourceSpec;
}

export interface ResourceBundle {
  _id: string;
  regionId: string;
  name: string;
  displayName: string;
  spec: ResourceBundleSpecMap;
  enableFreeTier?: boolean;
  limitCountOfFreeTierPerUser?: number;
  message?: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export type AppControllerGetRuntimesData = any;

export type ApplicationControllerFindOneData = any;

export type DatabaseControllerProxyData = any;

export type AccountControllerWechatNotifyData = any;

export interface LogControllerGetLogsParams {
  /** The request id. Optional */
  requestId?: string;
  /** The function name. Optional */
  functionName?: string;
  /** The page size, default is 10 */
  pageSize?: string;
  /** The page number, default is 1 */
  page?: string;
  appid: string;
}

export type RegionControllerGetRegionsData = any;

export type SettingControllerGetSettingsData = any;

export type SettingControllerGetSettingByKeyData = any;

export interface BillingControllerFindAllParams {
  /** appid */
  appid?: string;
  /**
   * pagination start time
   * @example "2021-01-01T00:00:00.000Z"
   */
  startTime?: string;
  /**
   * pagination end time
   * @example "2022-01-01T00:00:00.000Z"
   */
  endTime?: string;
  /**
   * page number
   * @example 1
   */
  page?: number;
  /**
   * page size
   * @example 10
   */
  pageSize?: number;
}
