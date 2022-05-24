import { Request, Response } from "express"
import { DatabaseAgent } from "../../db"
import { CN_REPLICATE_REQUESTS } from "../../constants"
import { IApplicationData } from "../../support/application"
import { checkPermission } from "../../support/permission"
import { ObjectId } from "mongodb"
import { deployFunctions, publishFunctions } from "../../support/function"
import { deployPolicies, publishAccessPolicies } from "../../support/policy"
import { ReplicationActionDef } from "../../actions"



/**
 * handle apply replicate request
 * @param req request
 * @param res response
 * @returns data
 */
export async function handleApplyReplicateRequest(req: Request, res: Response) {
  const uid = req["auth"]?.uid
  const id = req.params.id
  const app: IApplicationData = req["parsed-app"]

  // check login
  if (!uid) {
    res.status(401).send()
  }

  // check permission
  const code = await checkPermission(uid, ReplicationActionDef.UpdateReplicateRequest, app)
  if (code) {
    return res.status(code).send()
  }

  // check request
  const db = DatabaseAgent.db
  const request = await db.collection(CN_REPLICATE_REQUESTS)
    .findOne({ _id: new ObjectId(id), target_appid: app.appid })

  if (!request)
    return res.status(422).send('invalid request')

  if ('pending' !== request.status) {
    return res.status(422).send('invalid request')
  }

  // deploy
  if (request.functions?.items?.length) {
    await deployFunctions(app.appid, request.functions.items)
    await publishFunctions(app)
  }
  if (request.policies?.items?.length) {
    await deployPolicies(app.appid, request.policies.items)
    await publishAccessPolicies(app)
  }

  // update status
  await db.collection(CN_REPLICATE_REQUESTS)
    .updateOne({
      _id: new ObjectId(id),
      target_appid: app.appid
    }, {
      $set: {
        status: 'accepted',
        updated_at: new Date(),
        updated_by: new ObjectId(uid)
      }
    })

  return res.send({ data: 'accepted' })
}