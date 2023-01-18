export interface CreateFunctionDto {
  /** Function name is unique in the application */
  name: string;
  description?: string;
  websocket: boolean;
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
  websocket: boolean;
  methods: ("GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD")[];
  /** The source code of the function */
  code: string;
  tags?: string[];
}

export interface CompileFunctionDto {
  /** The source code of the function */
  code: string;
}

export interface CreateApplicationDto {
  name: string;
  /** @default "Running" */
  state?: "Running" | "Stopped";
  region: string;
  bundleName: string;
  runtimeName: string;
}

export interface UpdateApplicationDto {
  name?: string;
  state?: "Running" | "Stopped" | "Restarting";
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

export interface CreatePolicyDto {
  name: string;
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

export type CreateWebsiteDto = object;

export type UpdateWebsiteDto = object;

export interface Pat2TokenDto {
  /**
   * PAT
   * @example "laf_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
   */
  pat: string;
}

export interface UserProfileDto {
  uid: string;
  openid: string;
  avatar: string;
  name: string;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  username: string;
  phone: string;
  profile: UserProfileDto;
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  updatedAt: string;
}

export interface CreatePATDto {
  name: string;
  /** @min 60 */
  expiresIn: number;
}

export interface CreateDependencyDto {
  name: string;
  spec: string;
}

export interface UpdateDependencyDto {
  name: string;
  spec: string;
}

export interface CreateTriggerDto {
  desc: string;
  cron: string;
  target: string;
}

export type AppControllerGetRuntimesData = any;

export type ApplicationControllerCreateData = any;

export type ApplicationControllerFindAllData = any;

export type ApplicationControllerFindOneData = any;

export type ApplicationControllerUpdateData = any;

export type RegionControllerGetRegionsData = any;

export type DatabaseControllerProxyData = any;

export type WebsitesControllerCreateData = any;

export type WebsitesControllerFindAllData = any;

export type WebsitesControllerFindOneData = any;

export type WebsitesControllerUpdateData = any;

export type WebsitesControllerRemoveData = any;

export interface AuthControllerCode2TokenParams {
  code: string;
}

export interface LogControllerGetLogsParams {
  /** The request id. Optional */
  requestId?: string;
  /** The function name. Optional */
  functionName?: string;
  /** The limit number, default is 10 */
  limit?: string;
  /** The page number, default is 1 */
  page?: string;
  appid: string;
}
