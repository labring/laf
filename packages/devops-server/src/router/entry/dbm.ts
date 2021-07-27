import { Router } from 'express'
import { Entry, Ruler } from 'less-api'
import { Globals } from '../../lib/globals'
import { checkPermission } from '../../api/permission'

export const DbmEntryRouter = Router()

/**
 * 数据库数据管理入口请求：管理 app db
 */
DbmEntryRouter.post('/entry', async (req, res) => {
  const requestId = req['requestId']

  // 权限验证
  const code = await checkPermission(req['auth']?.uid, 'database.manage')
  if (code) {
    return res.status(code).send()
  }

  const accessor = Globals.app_accessor

  // 此处无需进行访问策略验证
  const entry = new Entry(accessor, new Ruler(accessor))

  // parse params
  const params = entry.parseParams({ ...req.body, requestId })

  // execute query
  try {
    const data = await entry.execute(params)

    return res.send({
      code: 0,
      data
    })
  } catch (error) {
    return res.send({
      code: 2,
      error: error
    })
  }
})