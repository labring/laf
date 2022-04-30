/*
 * @Author: Jessie<hkk@zhuo-zhuo.com>
 * @Date: 2022-04-29 11:35:05
 * @LastEditTime: 2022-04-29 13:51:17
 * @Description:
 */

import { Router } from "express"
import { handleCreateReplicateAuth } from "./create"
import { handleDeleteReplicateAuth } from "./delete"
import { handleGetReplicateAuth } from "./get"
import { handleUpdateReplicas } from "./replicas"
import { handleUpdateReplicateAuth } from "./update"

export const ReplicateRouter = Router()
/**
 * replicate auth list
 */
ReplicateRouter.get("/replicate_auth", handleGetReplicateAuth)
/**
 * replicate auth put
 */
ReplicateRouter.put("/replicate_auth", handleCreateReplicateAuth)
/**
 * replicate auth post
 */
ReplicateRouter.post("/replicate_auth/:id", handleUpdateReplicateAuth)
/**
 * replicate auth delete
 */
ReplicateRouter.delete("/replicate_auth/:id", handleDeleteReplicateAuth)

/**
 * put replicas
 */
ReplicateRouter.put("/replicas", handleUpdateReplicas)