import { NextApiRequest, NextApiResponse } from "next";

import { JsonResp } from "./response";

export default async function handler(req: NextApiRequest, resp: NextApiResponse) {
  const {
    query: { id, name },
    method,
  } = req;
  switch (method) {
    case "GET":
      JsonResp(
        {
          list: [
            {
              _id: "62da1be86827338a4f3f85cf",
              name: "role.create",
              label: "创建角色",
              created_at: 1658461160124,
              updated_at: 1658461160124,
            },
            {
              _id: "62da1be86827338a4f3f85d0",
              name: "role.read",
              label: "读取角色",
              created_at: 1658461160445,
              updated_at: 1658461160445,
            },
            {
              _id: "62da1be86827338a4f3f85d1",
              name: "role.edit",
              label: "编辑角色",
              created_at: 1658461160758,
              updated_at: 1658461160758,
            },
            {
              _id: "62da1be86827338a4f3f85d2",
              name: "role.delete",
              label: "删除角色",
              created_at: 1658461160848,
              updated_at: 1658461160848,
            },
            {
              _id: "62da1be86827338a4f3f85d3",
              name: "permission.create",
              label: "创建权限",
              created_at: 1658461160930,
              updated_at: 1658461160930,
            },
            {
              _id: "62da1be96827338a4f3f85d4",
              name: "permission.read",
              label: "读取权限",
              created_at: 1658461161500,
              updated_at: 1658461161500,
            },
            {
              _id: "62da1be96827338a4f3f85d5",
              name: "permission.edit",
              label: "编辑权限",
              created_at: 1658461161579,
              updated_at: 1658461161579,
            },
            {
              _id: "62da1be96827338a4f3f85d6",
              name: "permission.delete",
              label: "删除权限",
              created_at: 1658461161656,
              updated_at: 1658461161656,
            },
            {
              _id: "62da1bea6827338a4f3f85d7",
              name: "admin.create",
              label: "创建管理员",
              created_at: 1658461162219,
              updated_at: 1658461162219,
            },
            {
              _id: "62da1bea6827338a4f3f85d8",
              name: "admin.read",
              label: "获取管理员",
              created_at: 1658461162956,
              updated_at: 1658461162956,
            },
          ],
          limit: 10,
          offset: 0,
        },
        resp,
      );
      break;
  }
}
