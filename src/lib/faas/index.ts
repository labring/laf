import { accessor_ready } from '../db'
import { TriggerScheduler } from './trigger'

export * from './engine2'

export const scheduler = new TriggerScheduler()

// 当数据库连接成功时，初始化 scheduler
accessor_ready.then(() => {
  scheduler.init()
})