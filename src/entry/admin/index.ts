import {Router} from 'express'

const router = Router()

router.post('/entry', (_req, res) => {

  return res.send({
    code: 0,
    data: 'TBD'
  })
})

export default router