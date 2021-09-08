import { permissions as pns } from "./permissions"


const developer = [
  pns.POLICY_ADD, pns.POLICY_READ, pns.POLICY_REMOVE, pns.POLICY_UPDATE,
  pns.PUBLISH_POLICY,
  pns.FUNCTION_ADD, pns.FUNCTION_READ, pns.FUNCTION_REMOVE, pns.FUNCTION_UPDATE,
  pns.FUNCTION_DEBUG, pns.PUBLISH_FUNCTION,
  pns.TRIGGER_ADD, pns.TRIGGER_READ, pns.TRIGGER_REMOVE, pns.TRIGGER_UPDATE,
  pns.PUBLISH_TRIGGER
]

const dba = [
  pns.DATABASE_MANAGE,
  pns.FILE_ADD, pns.FILE_READ, pns.FILE_REMOVE, pns.FILE_UPDATE,
  pns.FILE_BUCKET_ADD, pns.FILE_BUCKET_REMOVE
]

const operator = [
  pns.DEPLOY_REQUEST_ADD, pns.DEPLOY_REQUEST_READ, pns.DEPLOY_REQUEST_REMOVE,
  pns.DEPLOY_REQUEST_UPDATE, pns.DEPLOY_REQUEST_APPLY,
  pns.DEPLOY_TARGET_ADD, pns.DEPLOY_TARGET_READ, pns.DEPLOY_TARGET_REMOVE,
  pns.DEPLOY_TARGET_UPDATE, pns.DEPLOY_TOKEN_CREATE
]

const owner = [
  pns.APPLICATION_ADD, pns.APPLICATION_READ, pns.APPLICATION_REMOVE,
  pns.APPLICATION_UPDATE,
  ...developer,
  ...dba,
  ...operator
]

export const roles = {
  developer: {
    name: 'developer',
    label: 'Developer',
    permissions: developer
  },
  dba: {
    name: 'dba',
    label: 'Database Administrator',
    permissions: dba
  },
  operator: {
    name: 'operator',
    label: 'Application Operator',
    permissions: operator
  },
  owner: {
    name: 'owner',
    label: 'Owner',
    permissions: owner
  }
}
