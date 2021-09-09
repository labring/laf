/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-09 14:46:44
 * @LastEditTime: 2021-09-10 00:42:10
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid } from '../../api/application'
import { publishFunctions } from '../../api/function'
import { checkPermission } from '../../api/permission'
import { publishAccessPolicies } from '../../api/policy'
import { Constants } from '../../constants'
import { ApplicationImporter } from '../../lib/importer'
import { logger } from '../../lib/logger'

const { APPLICATION_ADD } = Constants.permissions

/**
 * The handler of import application by id
 * @param req 
 * @param res 
 * @returns 
 */
export async function handleImportApplication(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app) return res.status(422).send('invalid appid')
  const import_data = req.body?.import_data
  if (!import_data) return res.status(422).send('import_data cannot be empty')

  // check permission
  const code = await checkPermission(uid, APPLICATION_ADD.name, app)
  if (code) return res.status(code).send()

  const importer = new ApplicationImporter(app, import_data)

  try {
    importer.parse()
    await importer.import()

    await publishFunctions(app)
    await publishAccessPolicies(app)
    return res.send({ data: 'ok' })
  } catch (error) {
    logger.error('import application got error:', error)
    return res.status(400).send({ error: error })
  }
}