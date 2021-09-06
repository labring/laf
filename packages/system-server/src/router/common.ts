/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:53:31
 * @LastEditTime: 2021-08-31 15:55:55
 * @Description: 
 */


import { Request, Response } from 'express'

/**
 * The handler of not implemented 
 */
export async function handleNotImplemented(_req: Request, res: Response) {
  return res.status(501).send('Not Implemented')
}