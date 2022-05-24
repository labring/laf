/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-09 14:46:44
 * @LastEditTime: 2021-12-21 15:40:38
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { ApplicationExporter } from '../../support/exporter'
import { ApplicationActionDef } from '../../actions'


/**
 * The handler of getting application by id
 * @param req 
 * @param res 
 * @returns 
 */
export async function handleExportApplication(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app) return res.status(422).send('invalid appid')

  // check permission
  const code = await checkPermission(uid, ApplicationActionDef.GetApplication, app)
  if (code) return res.status(code).send()

  const exporter = new ApplicationExporter(app)
  const zip = await exporter.build()

  return res
    .attachment(`${app.name}.zip`)
    .contentType('application/octet-stream')
    .send(zip.toBuffer())
}