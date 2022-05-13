import { ObjectId } from "mongodb"
import * as dns from "node:dns"
import { CN_WEBSITE_HOSTING } from "../../constants"
import { Request, Response } from "express"
import { CONST_DICTS } from "../../constants"
import { checkPermission } from "../../support/permission"
import { IApplicationData } from "../../support/application"
import { DatabaseAgent } from "../../db"
// import { handleCheckDomain } from "./domain-check"

/**
 * handle bind a domain to a website
 */
export async function handleBindDomain(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: IApplicationData = req["parsed-app"]
  const uid = req["auth"]?.uid
  const { domain, website_id } = req.body
  
  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const { WEBSITE_HOSTING_UPDATE } = CONST_DICTS.permissions
  const code = await checkPermission(uid, WEBSITE_HOSTING_UPDATE.name, app)
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
  if (!domain) {
    return res.status(422).send("invalid domain")
  }

  // check domain is available
  const dnsPromise = dns.promises
  const result = await dnsPromise.resolveCname(domain as string).catch(() => {})
  if (!result) {
    return res.send({code: 'DOMAIN_NOT_RESOLVEABLE', error: 'domain is not resolveable'})
  }
  if ((result || []).includes(website.cname)) {
    return res.send({code: 'DOMAIN_RESOLVED_ERROR', error: 'error resolved result got'})
  }

  // check if domain is already binded
  const existedDomain = await db
    .collection(CN_WEBSITE_HOSTING)
    .countDocuments({ domain })
  if (existedDomain) {
    return res.send({ code: 'ALREADY_EXISTED', error: "domain already binded" })
  }

  // bind
  const r = await db.collection(CN_WEBSITE_HOSTING).updateOne(
    { _id: new ObjectId(website_id), appid: app.appid },
    { $set: { domain, state: "pending", updated_at: new Date() } }
  )

  return res.send({ data: r.modifiedCount })
}
