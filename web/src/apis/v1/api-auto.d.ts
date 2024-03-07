declare namespace Definitions {
  export type CreateFunctionDto = {
    name?: string /* Function name is unique in the application */;
    description?: string;
    methods?: string[];
    code?: string /* The source code of the function */;
    tags?: string[];
  };

  export type CloudFunction = {
    _id?: string;
    appid?: string;
    name?: string;
    source?: Definitions.CloudFunctionSource;
    desc?: string;
    tags?: string[];
    methods?: string[];
    params?: {};
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
  };

  export type UpdateFunctionDto = {
    newName?: string /* Function name is unique in the application */;
    description?: string;
    methods?: string[];
    code?: string /* The source code of the function */;
    tags?: string[];
    changelog?: string;
  };

  export type UpdateFunctionDebugDto = {
    params?: {};
  };

  export type CompileFunctionDto = {
    code?: string /* The source code of the function */;
  };

  export type CreateApplicationDto = {
    cpu?: number;
    memory?: number;
    databaseCapacity?: number;
    storageCapacity?: number;
    autoscaling?: Definitions.CreateAutoscalingDto;
    dedicatedDatabase?: Definitions.CreateDedicatedDatabaseDto;
    name?: string;
    state?: string;
    regionId?: string;
    runtimeId?: string;
  };

  export type ApplicationWithRelations = {
    _id?: string;
    name?: string;
    appid?: string;
    regionId?: string;
    runtimeId?: string;
    tags?: string[];
    state?: string;
    phase?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    region?: Definitions.Region;
    bundle?: Definitions.ApplicationBundle;
    runtime?: Definitions.Runtime;
    configuration?: Definitions.ApplicationConfiguration;
    domain?: Definitions.RuntimeDomain;
  };

  export type Application = {
    _id?: string;
    name?: string;
    appid?: string;
    regionId?: string;
    runtimeId?: string;
    tags?: string[];
    state?: string;
    phase?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
  };

  export type UpdateApplicationNameDto = {
    name?: string;
  };

  export type UpdateApplicationStateDto = {
    state?: string;
  };

  export type UpdateApplicationBundleDto = {
    cpu?: number;
    memory?: number;
    databaseCapacity?: number;
    storageCapacity?: number;
    autoscaling?: Definitions.CreateAutoscalingDto;
    dedicatedDatabase?: Definitions.CreateDedicatedDatabaseDto;
  };

  export type ApplicationBundle = {
    _id?: string;
    appid?: string;
    resource?: Definitions.ApplicationBundleResource;
    autoscaling?: Definitions.Autoscaling;
    isTrialTier?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };

  export type BindCustomDomainDto = {
    domain?: string;
  };

  export type RuntimeDomain = {
    _id?: string;
    appid?: string;
    domain?: string;
    customDomain?: string;
    state?: string;
    phase?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  export type CreateEnvironmentDto = {
    name?: string;
    value?: string;
  };

  export type PodNameListDto = {
    appid?: string;
    podNameList?: string[] /* List of pod identifiers */;
  };

  export type ContainerNameListDto = {
    podName?: string;
    containerNameList?: string[] /* List of container identifiers */;
  };

  export type CreateBucketDto = {
    shortName?: string /* The short name of the bucket which not contain the appid */;
    policy?: string;
  };

  export type UpdateBucketDto = {
    policy?: string;
  };

  export type CreateCollectionDto = {
    name?: string;
  };

  export type Collection = {
    name?: string;
    type?: string;
    options?: {};
    info?: {};
    idIndex?: {};
  };

  export type UpdateCollectionDto = {
    validatorSchema?: {};
    validationLevel?: string;
  };

  export type CreatePolicyDto = {
    name?: string;
  };

  export type DatabasePolicyWithRules = {
    _id?: string;
    appid?: string;
    name?: string;
    injector?: string;
    createdAt?: string;
    updatedAt?: string;
    rules?: Definitions.DatabasePolicyRule[];
  };

  export type UpdatePolicyDto = {
    injector?: string;
  };

  export type DatabasePolicy = {
    _id?: string;
    appid?: string;
    name?: string;
    injector?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  export type CreatePolicyRuleDto = {
    collectionName?: string;
    value?: string;
  };

  export type DatabasePolicyRule = {
    _id?: string;
    appid?: string;
    policyName?: string;
    collectionName?: string;
    value?: {};
    createdAt?: string;
    updatedAt?: string;
  };

  export type UpdatePolicyRuleDto = {
    value?: string;
  };

  export type Account = {
    _id?: string;
    owedAt?: string /* The timestamp when the account became owed */;
    balance?: number;
    state?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
  };

  export type Number = {};

  export type AccountChargeOrder = {
    _id?: string;
    accountId?: string;
    amount?: number;
    currency?: string;
    phase?: string;
    channel?: string;
    result?: {};
    message?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
  };

  export type CreateChargeOrderDto = {
    amount?: number;
    channel?: string;
    currency?: string;
  };

  export type CreateChargeOrderOutDto = {
    order?: Definitions.AccountChargeOrder;
    result?: Definitions.WeChatPaymentCreateOrderResult;
  };

  export type UseGiftCodeDto = {
    code?: string /* gift code */;
  };

  export type InviteCode = {
    _id?: string;
    uid?: string;
    code?: string;
    state?: string;
    name?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  export type CreateWebsiteDto = {
    bucketName?: string;
    state?: string;
  };

  export type PasswdSignupDto = {
    username?: string /* username, 3-64 characters */;
    password?: string /* password, 8-64 characters */;
    phone?: string /* phone */;
    email?: string /* email */;
    code?: string /* verify code */;
    inviteCode?: string /* invite code */;
  };

  export type PasswdSigninDto = {
    username?: string /* username */;
    password?: string /* password, 8-64 characters */;
  };

  export type PasswdResetDto = {
    password?: string /* new password, 8-64 characters */;
    phone?: string /* phone */;
    email?: string /* email */;
    code?: string /* verify code */;
  };

  export type PasswdCheckDto = {
    username?: string /* username | phone | email */;
  };

  export type SendPhoneCodeDto = {
    phone?: string /* phone */;
    type?: string /* verify code type */;
  };

  export type PhoneSigninDto = {
    phone?: string /* phone */;
    code?: string;
    username?: string /* username */;
    password?: string /* password, 8-64 characters */;
    inviteCode?: string /* invite code */;
  };

  export type Pat2TokenDto = {
    pat?: string /* PAT */;
  };

  export type SendEmailCodeDto = {
    email?: string;
    type?: string /* verify code type */;
  };

  export type EmailSigninDto = {
    email?: string /* email */;
    code?: string;
    username?: string /* username */;
    password?: string /* password, 8-64 characters */;
    inviteCode?: string /* invite code */;
  };

  export type GithubSigninDto = {
    code?: string;
  };

  export type GithubBind = {
    token?: string /* temporary token signed for github bindings */;
    isRegister?: boolean /* Is a newly registered use */;
  };

  export type UserWithProfile = {
    _id?: string;
    username?: string;
    email?: string;
    phone?: string;
    github?: number;
    createdAt?: string;
    updatedAt?: string;
    profile?: Definitions.UserProfile;
  };

  export type CreatePATDto = {
    name?: string;
    expiresIn?: number;
  };

  export type BindPhoneDto = {
    oldPhoneNumber?: string /* old phone number */;
    newPhoneNumber?: string /* new phone number */;
    oldSmsCode?: string /* sms verify code for old phone number */;
    newSmsCode?: string /* sms verify code for new phone number */;
  };

  export type BindEmailDto = {
    email?: string;
    code?: string /* verify code */;
  };

  export type BindUsernameDto = {
    username?: string /* username */;
  };

  export type DeleteDependencyDto = {
    name?: string;
  };

  export type CreateTriggerDto = {
    desc?: string;
    cron?: string;
    target?: string;
  };

  export type CalculatePriceDto = {
    cpu?: number;
    memory?: number;
    databaseCapacity?: number;
    storageCapacity?: number;
    autoscaling?: Definitions.CreateAutoscalingDto;
    dedicatedDatabase?: Definitions.CreateDedicatedDatabaseDto;
    networkTraffic?: number;
    regionId?: string;
  };

  export type CalculatePriceResultDto = {
    cpu?: number;
    memory?: number;
    networkTraffic?: number;
    storageCapacity?: number;
    databaseCapacity?: number;
    total?: number;
  };

  export type CreateFunctionTemplateDto = {
    name?: string /* function template name */;
    dependencies?: Definitions.CreateDependencyDto[] /* Dependencies */;
    environments?: Definitions.CreateEnvironmentDto[] /* environments */;
    private?: boolean /* Private flag */;
    description?: string /* function template description */;
    items?: Definitions.FunctionTemplateItemDto[] /* items of the function template */;
  };

  export type UpdateFunctionTemplateDto = {
    functionTemplateId?: any /* Function template id */;
    name?: string /* Template name */;
    dependencies?: Definitions.CreateDependencyDto[] /* Dependencies */;
    environments?: Definitions.CreateEnvironmentDto[] /* Environments */;
    private?: boolean /* Private flag */;
    description?: string /* function template description */;
    items?: Definitions.FunctionTemplateItemDto[] /* items of the function template */;
  };

  export type DeleteRecycleBinItemsDto = {
    ids?: string[] /* The list of item ids */;
  };

  export type RestoreRecycleBinItemsDto = {
    ids?: string[] /* The list of item ids */;
  };

  export type Group = {
    _id?: string;
    name?: string;
    appid?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  export type GetGroupInviteCodeDetailDto = {
    group?: Definitions.Group;
    invitedBy?: Definitions.User;
  };

  export type CreateGroupDto = {
    name?: string;
  };

  export type UpdateGroupDto = {
    name?: string;
  };

  export type GenerateGroupInviteCodeDto = {
    role?: string;
  };

  export type GroupInviteCode = {
    _id?: string;
    usedBy?: string;
    code?: string;
    role?: string;
    groupId?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  export type GroupMember = {
    _id?: string;
    uid?: string;
    groupId?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  export type UpdateGroupMemberRoleDto = {
    role?: string;
  };

  export type CloudFunctionSource = {
    code?: string;
    compiled?: string;
    uri?: string;
    version?: number;
    hash?: string;
    lang?: string;
  };

  export type CreateAutoscalingDto = {
    enable?: boolean;
    minReplicas?: number;
    maxReplicas?: number;
    targetCPUUtilizationPercentage?: number;
    targetMemoryUtilizationPercentage?: number;
  };

  export type CreateDedicatedDatabaseDto = {
    cpu?: number;
    memory?: number;
    capacity?: number;
    replicas?: number;
  };

  export type Region = {
    _id?: string;
    name?: string;
    displayName?: string;
    state?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  export type ApplicationBundleResource = {
    limitCPU?: number;
    limitMemory?: number;
    databaseCapacity?: number;
    storageCapacity?: number;
    limitCountOfCloudFunction?: number;
    limitCountOfBucket?: number;
    limitCountOfDatabasePolicy?: number;
    limitCountOfTrigger?: number;
    limitCountOfWebsiteHosting?: number;
    reservedTimeAfterExpired?: number;
    dedicatedDatabase?: Definitions.DedicatedDatabaseSpec;
  };

  export type DedicatedDatabaseSpec = {
    limitCPU?: number;
    limitMemory?: number;
    capacity?: number;
    replicas?: number;
  };

  export type Autoscaling = {
    enable?: boolean;
    minReplicas?: number;
    maxReplicas?: number;
    targetCPUUtilizationPercentage?: number;
    targetMemoryUtilizationPercentage?: number;
  };

  export type Runtime = {
    _id?: string;
    name?: string;
    type?: string;
    image?: Definitions.RuntimeImageGroup;
    state?: string;
    version?: string;
    latest?: boolean;
  };

  export type RuntimeImageGroup = {
    main?: string;
    init?: string;
    sidecar?: string;
  };

  export type ApplicationConfiguration = {
    _id?: string;
    appid?: string;
    environments?: Definitions.EnvironmentVariable[];
    dependencies?: string[];
    createdAt?: string;
    updatedAt?: string;
  };

  export type EnvironmentVariable = {
    name?: string;
    value?: string;
  };

  export type WeChatPaymentCreateOrderResult = {
    code_url?: string;
  };

  export type UserProfile = {
    _id?: string;
    uid?: string;
    openData?: {};
    avatar?: string;
    name?: string;
    idVerified?: Definitions.IdVerified;
    idCard?: string;
    createdAt?: string;
    updatedAt?: string;
  };

  export type IdVerified = {
    isVerified?: boolean;
    idVerifyFailedTimes?: number;
  };

  export type CreateDependencyDto = {
    name?: string;
    spec?: string;
  };

  export type FunctionTemplateItemDto = {
    name?: string /* FunctionTemplate item name */;
    description?: string;
    methods?: string[];
    code?: string /* The source code of the function */;
  };

  export type User = {
    _id?: string;
    username?: string;
    email?: string;
    phone?: string;
    github?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

declare namespace Paths {
  namespace AppControllerGetRuntimes {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateFunctionDto;

    export type Responses = any;
  }

  namespace FunctionControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateFunctionDto;

    export type Responses = any;
  }

  namespace FunctionControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionControllerUpdateDebug {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateFunctionDebugDto;

    export type Responses = any;
  }

  namespace FunctionControllerCompile {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CompileFunctionDto;

    export type Responses = any;
  }

  namespace FunctionControllerGetHistory {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ApplicationControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateApplicationDto;

    export type Responses = any;
  }

  namespace ApplicationControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ApplicationControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ApplicationControllerDelete {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ApplicationControllerUpdateName {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateApplicationNameDto;

    export type Responses = any;
  }

  namespace ApplicationControllerUpdateState {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateApplicationStateDto;

    export type Responses = any;
  }

  namespace ApplicationControllerUpdateBundle {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateApplicationBundleDto;

    export type Responses = any;
  }

  namespace ApplicationControllerBindDomain {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.BindCustomDomainDto;

    export type Responses = any;
  }

  namespace ApplicationControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ApplicationControllerCheckResolved {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.BindCustomDomainDto;

    export type Responses = any;
  }

  namespace EnvironmentVariableControllerUpdateAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace EnvironmentVariableControllerAdd {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateEnvironmentDto;

    export type Responses = any;
  }

  namespace EnvironmentVariableControllerGet {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace EnvironmentVariableControllerDelete {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PodControllerGetPodNameList {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PodControllerGetContainerNameList {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BucketControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateBucketDto;

    export type Responses = any;
  }

  namespace BucketControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BucketControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BucketControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateBucketDto;

    export type Responses = any;
  }

  namespace BucketControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace CollectionControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateCollectionDto;

    export type Responses = any;
  }

  namespace CollectionControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace CollectionControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace CollectionControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateCollectionDto;

    export type Responses = any;
  }

  namespace CollectionControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PolicyControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreatePolicyDto;

    export type Responses = any;
  }

  namespace PolicyControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PolicyControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdatePolicyDto;

    export type Responses = any;
  }

  namespace PolicyControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DatabaseControllerProxy {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DatabaseControllerExportDatabase {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DatabaseControllerImportDatabase {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PolicyRuleControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreatePolicyRuleDto;

    export type Responses = any;
  }

  namespace PolicyRuleControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PolicyRuleControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdatePolicyRuleDto;

    export type Responses = any;
  }

  namespace PolicyRuleControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DedicatedDatabaseMonitorControllerGetResource {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DedicatedDatabaseMonitorControllerGetConnection {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DedicatedDatabaseMonitorControllerGetPerformance {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AccountControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AccountControllerGetChargeOrderAmount {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AccountControllerGetChargeOrder {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AccountControllerGetChargeRecords {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AccountControllerCharge {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateChargeOrderDto;

    export type Responses = any;
  }

  namespace AccountControllerGetChargeRewardList {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AccountControllerWechatNotify {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AccountControllerGiftCode {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UseGiftCodeDto;

    export type Responses = any;
  }

  namespace AccountControllerInviteCode {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AccountControllerInviteCodeProfit {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace WebsiteControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateWebsiteDto;

    export type Responses = any;
  }

  namespace WebsiteControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace WebsiteControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace WebsiteControllerBindDomain {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.BindCustomDomainDto;

    export type Responses = any;
  }

  namespace WebsiteControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace WebsiteControllerCheckResolved {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.BindCustomDomainDto;

    export type Responses = any;
  }

  namespace UserPasswordControllerSignup {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.PasswdSignupDto;

    export type Responses = any;
  }

  namespace UserPasswordControllerSignin {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.PasswdSigninDto;

    export type Responses = any;
  }

  namespace UserPasswordControllerReset {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.PasswdResetDto;

    export type Responses = any;
  }

  namespace UserPasswordControllerCheck {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.PasswdCheckDto;

    export type Responses = any;
  }

  namespace PhoneControllerSendCode {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.SendPhoneCodeDto;

    export type Responses = any;
  }

  namespace PhoneControllerSignin {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.PhoneSigninDto;

    export type Responses = any;
  }

  namespace AuthenticationControllerGetProviders {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace AuthenticationControllerPat2token {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.Pat2TokenDto;

    export type Responses = any;
  }

  namespace EmailControllerSendCode {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.SendEmailCodeDto;

    export type Responses = any;
  }

  namespace EmailControllerSignin {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.EmailSigninDto;

    export type Responses = any;
  }

  namespace GithubAuthControllerJumpLogin {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GithubAuthControllerSignin {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.GithubSigninDto;

    export type Responses = any;
  }

  namespace GithubAuthControllerBind {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.GithubBind;

    export type Responses = any;
  }

  namespace GithubAuthControllerUnbind {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PatControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreatePATDto;

    export type Responses = any;
  }

  namespace PatControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace PatControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace UserControllerUpdateAvatar {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace UserControllerGetAvatar {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace UserControllerBindPhone {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.BindPhoneDto;

    export type Responses = any;
  }

  namespace UserControllerBindEmail {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.BindEmailDto;

    export type Responses = any;
  }

  namespace UserControllerBindUsername {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.BindUsernameDto;

    export type Responses = any;
  }

  namespace UserControllerGetProfile {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace LogControllerGetLogs {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace LogControllerStreamLogs {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DependencyControllerAdd {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DependencyControllerUpdate {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DependencyControllerGetDependencies {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace DependencyControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.DeleteDependencyDto;

    export type Responses = any;
  }

  namespace TriggerControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateTriggerDto;

    export type Responses = any;
  }

  namespace TriggerControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace TriggerControllerRemove {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace RegionControllerGetRegions {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace SettingControllerGetSettings {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace SettingControllerGetSettingByKey {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BillingControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BillingControllerGetExpense {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace BillingControllerGetExpenseByDay {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ResourceControllerCalculatePrice {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CalculatePriceDto;

    export type Responses = any;
  }

  namespace ResourceControllerGetResourceOptions {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ResourceControllerGetResourceOptionsByRegionId {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace ResourceControllerGetResourceBundles {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerCreateFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateFunctionTemplateDto;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerGetAllFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerUseFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerUpdateFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateFunctionTemplateDto;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerDeleteFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerGetOneFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerStarFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerGetUserFunctionTemplateStarState {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerGetFunctionTemplateUsedBy {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerGetMyFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionTemplateControllerGetRecommendFunctionTemplate {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionRecycleBinControllerDeleteRecycleBinItems {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.DeleteRecycleBinItemsDto;

    export type Responses = any;
  }

  namespace FunctionRecycleBinControllerEmptyRecycleBin {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionRecycleBinControllerGetRecycleBin {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace FunctionRecycleBinControllerRestoreRecycleBinItems {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.RestoreRecycleBinItemsDto;

    export type Responses = any;
  }

  namespace GroupControllerFindGroupByAppId {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupControllerFindGroupByInviteCode {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupControllerCreate {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.CreateGroupDto;

    export type Responses = any;
  }

  namespace GroupControllerDelete {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupControllerFindOne {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupControllerUpdateGroup {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateGroupDto;

    export type Responses = any;
  }

  namespace GroupInviteControllerGetInviteCode {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupInviteControllerGenerateInviteCode {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.GenerateGroupInviteCodeDto;

    export type Responses = any;
  }

  namespace GroupInviteControllerDeleteInviteCode {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupMemberControllerFindMembers {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupMemberControllerAddMember {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupMemberControllerRemoveMember {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace GroupMemberControllerUpdateMemberRole {
    export type QueryParameters = any;

    export type BodyParameters = Definitions.UpdateGroupMemberRoleDto;

    export type Responses = any;
  }

  namespace GroupMemberControllerLeaveGroup {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace MonitorControllerGetData {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }

  namespace NotificationControllerFindAll {
    export type QueryParameters = any;

    export type BodyParameters = any;

    export type Responses = any;
  }
}
