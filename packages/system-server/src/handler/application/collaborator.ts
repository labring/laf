/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-12-09 08:29:02
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { CN_ACCOUNTS, CN_APPLICATIONS } from '../../constants'
import { DatabaseAgent } from '../../db'
import { ApplicationActionDef } from '../../actions'
import { getAccountByUsername, isValidAccountId, isValidRoleNames } from '../../support/account'
import { array2map, mergeMap2ArrayByKey } from '../../support/util-lang'
import { ObjectId } from 'mongodb'
import { Groups } from '../../groups'


/**
 * The handler of getting collaborators of an application
 */
export async function handleGetCollaborators(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()


  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('invalid appid')

  // check permission
  const code = await checkPermission(uid, ApplicationActionDef.GetApplication, app)
  if (code) {
    return res.status(code).send()
  }

  if (!app.collaborators?.length) {
    return res.send({ data: [] })
  }

  const db = DatabaseAgent.db
  const docs = await db.collection(CN_ACCOUNTS)
    .find({
      _id: {
        $in: app.collaborators.map(co => co.uid)
      }
    }, {
      projection: { '_id': 1, 'username': 1, 'name': 1 }
    })
    .toArray()

  // merge app
  const user_map = array2map(docs, '_id', true)
  const ret = mergeMap2ArrayByKey(user_map, app.collaborators, 'uid', 'user')
  return res.send({
    data: ret
  })
}

/**
 * The handler of inviting collaborator
 */
export async function handleInviteCollaborator(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const { member_id, roles } = req.body

  if (!isValidRoleNames(roles))
    return res.status(422).send('invalid roles')

  if (!isValidAccountId(member_id))
    return res.status(422).send('invalid member_id')

  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app) {
    return res.status(422).send('app not found')
  }

  // check permission
  const code = await checkPermission(uid, ApplicationActionDef.UpdateApplication, app)
  if (code) {
    return res.status(code).send()
  }

  // reject if collaborator exists
  const exists = app.collaborators.filter(it => it.uid.toHexString() === member_id)
  if (exists.length) {
    return res.status(422).send('collaborator already exists')
  }

  // reject if the application owner get here
  if (app.created_by.toHexString() === member_id) {
    return res.status(422).send('collaborator is already the owner of this application')
  }

  // add a collaborator
  const collaborator = {
    uid: new ObjectId(member_id),
    roles,
    created_at: new Date()
  }
  const ret = await db.collection(CN_APPLICATIONS)
    .updateOne({
      appid: app.appid
    }, {
      $addToSet: {
        collaborators: collaborator
      }
    })

  return res.send({
    data: ret
  })
}

/**
 * The handler of searching collaborator
 */
export async function handleSearchCollaborator(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const username = req.body?.username
  if (!username) return res.status(422).send('username cannot be empty')

  const account = await getAccountByUsername(username)
  if (!account) {
    return res.send({ data: null })
  }

  return res.send({
    data: {
      _id: account._id,
      username: account.username,
      name: account.name
    }
  })
}

/**
 * The handler of getting roles
 */
export async function handleGetRoles(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const roles = Groups
  return res.send({
    data: roles
  })
}

/**
 * The handler of removing collaborator of an application
 */
export async function handleRemoveCollaborator(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('invalid appid')

  // check permission
  const code = await checkPermission(uid, ApplicationActionDef.UpdateApplication, app)
  if (code) {
    return res.status(code).send()
  }

  // check collaborator_id
  const collaborator_id = req.params.collaborator_id
  const [found] = app.collaborators.filter(co => co.uid.toHexString() === collaborator_id)
  if (!found) {
    return res.status(422).send('invalid collaborator_id')
  }

  const db = DatabaseAgent.db
  const r = await db.collection(CN_APPLICATIONS)
    .updateOne({ appid }, {
      $pull: {
        collaborators: { uid: new ObjectId(collaborator_id) }
      }
    })

  return res.send({
    data: r
  })
}