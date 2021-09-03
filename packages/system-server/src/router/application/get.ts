/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-09-03 20:21:48
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid, getMyApplications, getMyJoinedApplications } from '../../api/application'
import { getPermissionsOfRoles } from '../../api/permission'
import { Constants } from '../../constants'

/**
 * The handler of getting my applications(created & joined)
 */
export async function handleMyApplications(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const created = await getMyApplications(uid)
  const joined = await getMyJoinedApplications(uid)

  return res.send({
    data: {
      created,
      joined
    }
  })
}

/**
 * The handler of getting application by id
 * @param req 
 * @param res 
 * @returns 
 */
export async function handleGetApplicationByAppid(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('invalid appid')

  app.config = undefined
  // return directly if the author here
  if (app.created_by === uid) {
    const roles = [Constants.roles.owner.name]
    const permissions = getPermissionsOfRoles(roles)
    return res.send({
      data: {
        application: app,
        permissions,
        roles
      }
    })
  }

  // reject if not the collaborator
  const [found] = app.collaborators.filter(co => co.uid === uid)
  if (!found) {
    return res.status(403).send()
  }

  const roles = found.roles
  const permissions = getPermissionsOfRoles(roles)

  return res.send({
    data: {
      application: app,
      permissions,
      roles
    }
  })
}