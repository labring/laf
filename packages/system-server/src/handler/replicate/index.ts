/*
 * @Author: Jessie<hkk@zhuo-zhuo.com>
 * @Date: 2022-04-29 11:35:05
 * @LastEditTime: 2022-04-29 13:51:17
 * @Description:
 */

import { Router } from "express"
import { handleCreateReplicateAuth } from "./create-replicate-auth "
import { handleDeleteReplicateAuth } from "./delete-replicate-auth"
import { handleGetReplicateAuth } from "./get-replicate-auth"
import { handleUpdateReplicateAuth } from "./update-replicate-auth"

export const ReplicateRouter = Router()
/**
 * 应用授权资源列表查询
 */
ReplicateRouter.get('/replicate_auth', handleGetReplicateAuth)
/**
 * 应用授权添加(目标环境发起授权申请) 
 */
ReplicateRouter.put('/replicate_auth', handleCreateReplicateAuth)
/**
 * 应用授权编辑（授权申请审批）
 */
ReplicateRouter.post('/replicate_auth/:id', handleUpdateReplicateAuth)
/**
 * 应用授权删除（删除目标应用和原应用的授权关系）源和目标都可以操作
 */
ReplicateRouter.delete('/replicate_auth/:id', handleDeleteReplicateAuth)
