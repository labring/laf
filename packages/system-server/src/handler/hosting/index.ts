import { Router } from "express"
import { handleCreateWebsite } from "./website-create"
import { handleGetWebsites } from "./website-get"

export const WebsiteRouter = Router()

/**
 * create website
 */
 WebsiteRouter.put("/website", handleCreateWebsite)

/**
 * get websites
 */
 WebsiteRouter.get("/websites", handleGetWebsites)