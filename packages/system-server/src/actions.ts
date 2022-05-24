
export interface IActionDef {
  [key: string]: string
}

export const FunctionActionDef = {
  ListFunctions: 'fn:ListFunctions',
  GetFunction: 'fn:GetFunction',
  CreateFunction: 'fn:CreateFunction',
  UpdateFunction: 'fn:UpdateFunction',
  DeleteFunction: 'fn:DeleteFunction',
  InvokeFunction: 'fn:InvokeFunction',
  PublishFunction: 'fn:PublishFunction',
  ListLogs: 'fn:ListLogs',
  ListPackages: 'fn:ListPackages',
  CreatePackage: 'fn:CreatePackage',
  UpdatePackage: 'fn:UpdatePackage',
  DeletePackage: 'fn:DeletePackage',
}

export const ApplicationActionDef = {
  ListApplications: 'app:ListApplications',
  GetApplication: 'app:GetApplication',
  CreateApplication: 'app:CreateApplication',
  UpdateApplication: 'app:UpdateApplication',
  DeleteApplication: 'app:DeleteApplication',
  StartInstance: 'app:StartInstance',
  StopInstance: 'app:StopInstance',
}

export const DatabaseActionDef = {
  ListCollections: 'db:ListCollections',
  GetCollection: 'db:GetCollection',
  CreateCollection: 'db:CreateCollection',
  UpdateCollection: 'db:UpdateCollection',
  DeleteCollection: 'db:DeleteCollection',
  ListDocuments: 'db:ListDocuments',
  GetDocument: 'db:GetDocument',
  CreateDocument: 'db:CreateDocument',
  UpdateDocument: 'db:UpdateDocument',
  DeleteDocument: 'db:DeleteDocument',
  ListPolicies: 'db:ListPolicies',
  GetPolicy: 'db:GetPolicy',
  CreatePolicy: 'db:CreatePolicy',
  UpdatePolicy: 'db:UpdatePolicy',
  DeletePolicy: 'db:DeletePolicy',
  PublishPolicy: 'db:PublishPolicy',
}

export const StorageActionDef = {
  ListBuckets: 'oss:ListBuckets',
  GetBucket: 'oss:GetBucket',
  CreateBucket: 'oss:CreateBucket',
  UpdateBucket: 'oss:UpdateBucket',
  DeleteBucket: 'oss:DeleteBucket',
  CreateServiceAccount: 'oss:CreateServiceAccount',
}

export const ReplicationActionDef = {
  ListReplicateAuth: 'rep:ListReplicateAuth',
  GetReplicateAuth: 'rep:GetReplicateAuth',
  CreateReplicateAuth: 'rep:CreateReplicateAuth',
  UpdateReplicateAuth: 'rep:UpdateReplicateAuth',
  DeleteReplicateAuth: 'rep:DeleteReplicateAuth',
  ListReplicateRequest: 'rep:ListReplicateRequest',
  GetReplicateRequest: 'rep:GetReplicateRequest',
  CreateReplicateRequest: 'rep:CreateReplicateRequest',
  UpdateReplicateRequest: 'rep:UpdateReplicateRequest',
  DeleteReplicateRequest: 'rep:DeleteReplicateRequest',
}

export const WebsiteActionDef = {
  ListWebsites: 'web:ListWebsites',
  GetWebsite: 'web:GetWebsite',
  CreateWebsite: 'web:CreateWebsite',
  UpdateWebsite: 'web:UpdateWebsite',
  DeleteWebsite: 'web:DeleteWebsite',
}


export function get_actions(action_def: IActionDef) {
  const actions: string[] = []
  for (const key in action_def) {
    if (action_def.hasOwnProperty(key)) {
      actions.push(action_def[key])
    }
  }
  return actions
}