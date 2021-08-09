import { Constants } from "../constants"

const cn = Constants.cn

export default {
  [cn.admins]: {
    "read": "$has('admin.read')",
    "update": "$has('admin.edit')",
    "add": "$has('admin.create')",
    "remove": "$has('admin.delete')",
    "count": "$has('admin.read')"
  },
  [cn.permissions]: {
    "read": "$has('permission.read')",
    "count": "$has('permission.read')"
  },
  [cn.roles]: {
    "read": "$has('role.read')",
    "update": "$has('role.edit')",
    "add": "$has('role.create')",
    "remove": {
      "condition": "$has('role.delete')",
      "query": {
        "name": {
          "required": true,
          "notExists": `/${cn.admins}/roles`
        }
      }
    },
    "count": "$has('role.read')"
  },
  [cn.policies]: {
    "read": "$has('policy.read')",
    "update": "$has('policy.edit')",
    "add": "$has('policy.create')",
    "remove": "$has('policy.delete')",
    "count": "$has('policy.read')"
  },
  [cn.functions]: {
    "read": "$has('function.read')",
    "update": "$has('function.edit')",
    "add": "$has('function.create')",
    "remove": {
      "condition": "$has('function.delete')",
      "query": {
        "_id": {
          "notExists": `/${cn.triggers}/func_id`
        },
        "status": {
          "required": true,
          "default": 0,
          "in": [
            0
          ]
        },
        "reserved": "$value !== true"
      }
    },
    "count": "$has('function.read')"
  },
  [cn.function_history]: {
    "read": "$has('function_history.read')",
    "add": "$has('function_history.create')",
    "count": "$has('function_history.read')"
  },
  [cn.triggers]: {
    "read": "$has('trigger.read')",
    "update": "$has('trigger.edit')",
    "add": "$has('trigger.create')",
    "remove": "$has('trigger.delete') && query.status === 0",
    "count": "$has('trigger.read')"
  },
  [cn.deploy_targets]: {
    "read": "$has('deploy_target.read')",
    "update": "$has('deploy_target.edit')",
    "add": "$has('deploy_target.create')",
    "remove": "$has('deploy_target.delete')",
    "count": "$has('deploy_target.read')"
  },
  [cn.deploy_requests]: {
    "read": "$has('deploy_request.read')",
    "update": "$has('deploy_request.edit')",
    "add": "$has('deploy_request.create')",
    "remove": "$has('deploy_request.delete')",
    "count": "$has('deploy_request.read')"
  }
}