import { ObjectId } from "mongodb"
import * as dns from "node:dns"
import { CN_WEBSITE_HOSTING, REGEX_DOMAIN } from "../../constants"
import { Request, Response } from "express"
import { checkPermission } from "../../support/permission"
import { IApplicationData } from "../../support/application"
import { DatabaseAgent } from "../../db"
import { WebsiteActionDef } from "../../actions"
import {createWebsiteRoute} from "../../support/route";


/**
 * handle bind a domain to a website
 */
export async function handleBindDomain(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid
  const website_id = req.body?.website_id
  const domain = req.body?.domain || ''

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const code = await checkPermission(uid, WebsiteActionDef.UpdateWebsite, app)
  if (code) {
    return res.status(code).send()
  }

  // check id
  const website = await db
    .collection(CN_WEBSITE_HOSTING)
    .findOne({ _id: new ObjectId(website_id), appid: app.appid })
  if (!website) {
    return res.status(422).send("invalid id")
  }

  // check domain
  if (REGEX_DOMAIN.test(domain) === false) {
    return res.status(422).send("invalid domain")
  }

  // check domain is available
  const resolver = new dns.promises.Resolver({ timeout: 3000, tries: 1 })
  const result = await resolver.resolveCname(domain as string).catch(() => { })
  if (!result) {
    return res.send({ code: 'DOMAIN_NOT_RESOLVEABLE', error: 'domain is not resolveable' })
  }

  if (false === (result || []).includes(website.cname)) {
    return res.send({ code: 'DOMAIN_RESOLVED_ERROR', error: 'error resolved result got' })
  }

  // check if domain is already binded
  const existedDomain = await db
    .collection(CN_WEBSITE_HOSTING)
    .countDocuments({ domain, status: { $ne: "deleted" } })

  if (existedDomain) {
    return res.send({ code: 'ALREADY_EXISTED', error: "domain already binded" })
  }

  // bind
  const r = await db.collection(CN_WEBSITE_HOSTING).updateOne(
    { _id: new ObjectId(website_id), appid: app.appid },
    {
      $set: { state: "pending", updated_at: new Date() },
      $push: { domain: domain }
    }
  )
  const domainList = [domain, website.cname]
  const rt = await createWebsiteRoute('website-custom', app.appid, website_id, domainList, uid)
  if (!rt) {
      return res.send({ code: 'ROUTE CREATE FAILED', error: "route create failed" })
  }

  return res.send({ data: r.modifiedCount })
}