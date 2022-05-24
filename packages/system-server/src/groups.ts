
import { get_actions, FunctionActionDef, DatabaseActionDef, StorageActionDef, ReplicationActionDef, ApplicationActionDef, WebsiteActionDef } from './actions'


export const FunctionReadyOnly = {
  name: 'FunctionReadyOnly',
  label: 'Function Ready Only',
  actions: [
    FunctionActionDef.ListFunctions,
    FunctionActionDef.GetFunction,
    FunctionActionDef.ListLogs,
    FunctionActionDef.ListPackages,
  ]
}

export const FunctionFullAccess = {
  name: 'FunctionFullAccess',
  label: 'Function Full Access',
  actions: get_actions(FunctionActionDef)
}

export const DatabaseReadyOnly = {
  name: 'DatabaseReadyOnly',
  label: 'Database Ready Only',
  actions: [
    DatabaseActionDef.ListCollections,
    DatabaseActionDef.GetCollection,
    DatabaseActionDef.ListDocuments,
    DatabaseActionDef.GetDocument,
    DatabaseActionDef.ListPolicies,
    DatabaseActionDef.GetPolicy,
  ]
}

export const DatabaseFullAccess = {
  name: 'DatabaseFullAccess',
  label: 'Database Full Access',
  actions: get_actions(DatabaseActionDef)
}

export const StorageReadOnly = {
  name: 'StorageReadOnly',
  label: 'Storage Read Only',
  actions: [
    StorageActionDef.ListBuckets,
    StorageActionDef.GetBucket,
  ]
}

export const StorageFullAccess = {
  name: 'StorageFullAccess',
  label: 'Storage Full Access',
  actions: get_actions(StorageActionDef)
}

export const ReplicationReadOnly = {
  name: 'ReplicationReadOnly',
  label: 'Replication Read Only',
  actions: [
    ReplicationActionDef.ListReplicateAuth,
    ReplicationActionDef.GetReplicateAuth,
    ReplicationActionDef.ListReplicateRequest,
    ReplicationActionDef.GetReplicateRequest,
  ]
}

export const ReplicationFullAccess = {
  name: 'ReplicationFullAccess',
  label: 'Replication Full Access',
  actions: get_actions(ReplicationActionDef)
}

export const ApplicationReadOnly = {
  name: 'ApplicationReadOnly',
  label: 'Application Read Only',
  actions: [
    ApplicationActionDef.ListApplications,
    ApplicationActionDef.GetApplication,
  ]
}

export const InstanceOperator = {
  name: 'InstanceOperator',
  label: 'Instance Operator',
  actions: [
    ApplicationActionDef.StartInstance,
    ApplicationActionDef.StopInstance,
  ]
}

export const ApplicationFullAccess = {
  name: 'ApplicationFullAccess',
  label: 'Application Full Access',
  actions: get_actions(ApplicationActionDef)
}

export const WebsiteReadOnly = {
  name: 'WebsiteReadOnly',
  label: 'Website Read Only',
  actions: [
    WebsiteActionDef.ListWebsites,
    WebsiteActionDef.GetWebsite,
  ]
}

export const WebsiteFullAccess = {
  name: 'WebsiteFullAccess',
  label: 'Website Full Access',
  actions: get_actions(WebsiteActionDef)
}

export const Admin = {
  name: 'Admin',
  label: 'Admin',
  actions: [
    ...get_actions(FunctionActionDef),
    ...get_actions(DatabaseActionDef),
    ...get_actions(StorageActionDef),
    ...get_actions(ReplicationActionDef),
    ...get_actions(ApplicationActionDef),
    ...get_actions(WebsiteActionDef),
  ]
}

export const Groups = [
  FunctionReadyOnly,
  FunctionFullAccess,
  DatabaseReadyOnly,
  DatabaseFullAccess,
  StorageReadOnly,
  StorageFullAccess,
  ReplicationReadOnly,
  ReplicationFullAccess,
  ApplicationReadOnly,
  InstanceOperator,
  ApplicationFullAccess,
  WebsiteReadOnly,
  WebsiteFullAccess,
  Admin
]
