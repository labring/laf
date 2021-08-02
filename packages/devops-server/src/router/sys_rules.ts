export default {
  "__admins": {
    "read": "$has('admin.read')",
    "update": "$has('admin.edit')",
    "add": "$has('admin.create')",
    "remove": "$has('admin.delete')"
  },
  "__permissions": {
    "read": "$has('permission.read')",
    "count": "$has('permission.read')"
  },
  "__roles": {
    "read": "$has('role.read')",
    "update": "$has('role.edit')",
    "add": "$has('role.create')",
    "remove": {
      "condition": "$has('role.delete')",
      "query": {
        "name": {
          "required": true,
          "notExists": "/__admins/roles"
        }
      }
    }
  },
  "__policies": {
    "read": "$has('policy.read')",
    "update": "$has('policy.edit')",
    "add": "$has('policy.create')",
    "remove": "$has('policy.delete')"
  },
  "__functions": {
    "read": "$has('function.read')",
    "update": "$has('function.edit')",
    "add": "$has('function.create')",
    "remove": {
      "condition": "$has('function.delete')",
      "query": {
        "_id": {
          "notExists": "/triggers/func_id"
        },
        "status": {
          "required": true,
          "default": 0,
          "in": [
            0
          ]
        }
      }
    },
    "count": "$has('function.read')"
  },
  "__function_logs": {
    "read": "$has('function_logs.read')",
    "remove": "$has('function_logs.remove')",
    "count": "$has('function_logs.read')"
  },
  "__function_history": {
    "read": "$has('function_history.read')",
    "add": "$has('function_history.create')",
    "count": "$has('function_history.read')"
  },
  "__triggers": {
    "read": "$has('trigger.read')",
    "update": "$has('trigger.edit')",
    "add": "$has('trigger.create')",
    "remove": "$has('trigger.delete') && query.status === 0",
    "count": "$has('trigger.read')"
  }
}