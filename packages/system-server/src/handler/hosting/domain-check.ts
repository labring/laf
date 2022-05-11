import { Request, Response } from "express"
import * as dns from "node:dns"
import { IApplicationData } from "../../support/application"
import { DatabaseAgent } from "../../db"
import { CN_WEBSITE_HOSTING } from "../../constants"

/**
 * check if a domain is resolveable
 * @param req request
 * @param res response
 * @returns data
 */
export async function handleCheckDomain(req: Request, res: Response) {
  const uid = req["auth"]?.uid
  const { domain } = req.query

  console.log('handleCheckDomain', domain, req.query)

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check domain is valid
  if (!domain) {
    return res.status(422).send("no domain")
  }

  // check domain is resolveable
  const dnsPromise = dns.promises
  const d = await dnsPromise.lookup(domain as string).catch(() => {})
  if (!d || !d.address) {
    return res.status(422).send("domain not resolveable")
  }

  // check domain is not in use
  const existed = await DatabaseAgent.db
    .collection<IApplicationData>(CN_WEBSITE_HOSTING)
    .countDocuments({ domain })
  if (existed) {
    return res.status(422).send("domain is in use")
  }

  return res.send({ data: true })
}