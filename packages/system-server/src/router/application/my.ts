/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-08-30 15:24:23
 * @Description: 
 */

import { Request, Response } from 'express'

/**
 * The handler of getting profile
 */
export async function handleMyApplications(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid) {
    return res.status(401)
  }
}