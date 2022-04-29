import { Request, Response } from "express"
import { CN_REPLICATE_AUTH, CONST_DICTS } from "../../constants"
import { DatabaseAgent } from "../../db"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"

/**
 * 处理获取应用授权资源列表信息
 */
export async function handleGetReplicateAuth(req: Request, res: Response) {
  const { permissions, expire, source } = req.body
  if (!permissions || !permissions?.length) return res.status(422).send('invalid permissions')
  if (!expire) return res.status(422).send('invalid expire')
  if (!source) return res.status(422).send('invalid source')

  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const { REPLICATE_AUTH_READ } = CONST_DICTS.permissions
  const code = await checkPermission(uid, REPLICATE_AUTH_READ.name, app)
  if (code) {
    return res.status(code).send()
  }
  const db = DatabaseAgent.db
  const docs = await db.collection(CN_REPLICATE_AUTH)
    .find({ appid: app.appid })
    .toArray()

  return res.send({ data: docs })
}