import { Router } from "express"
import { handleCreateWebsite } from "./website-create"
import { handleGetWebsites } from "./website-get"
import { handleDeleteWebsite } from "./website-delete"
import { handleCheckDomain } from "./domain-check"
import { handleBindDomain } from "./domain-bind"

export const WebsiteRouter = Router()

/**
 * create website
 */
 WebsiteRouter.put("/website", handleCreateWebsite)

/**
 * get websites
 */
WebsiteRouter.get("/websites", handleGetWebsites)
 
/**
 * delete website
 */
WebsiteRouter.delete("/website/:id", handleDeleteWebsite)

/**
 * bind domain
 */
WebsiteRouter.post("/domain/bind", handleBindDomain)

/**
 * check domain
 */
WebsiteRouter.get("/domain/resolve", handleCheckDomain)