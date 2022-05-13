import { Router } from "express"
import { handleCreateWebsite } from "./website-create"
import { handleGetWebsites } from "./website-get"
import { handleDeleteWebsite } from "./website-delete"
import { handleBindDomain } from "./domain-bind"

export const WebsiteRouter = Router()

/**
 * create website
 */
 WebsiteRouter.put("/", handleCreateWebsite)

/**
 * get websites
 */
WebsiteRouter.get("/", handleGetWebsites)
 
/**
 * delete website
 */
WebsiteRouter.delete("/:id", handleDeleteWebsite)

/**
 * bind domain
 */
WebsiteRouter.post("/domain/bind", handleBindDomain)