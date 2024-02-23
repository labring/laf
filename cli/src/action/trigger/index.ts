import { CreateTriggerDto } from '../../api/v1/data-contracts'
import { triggerControllerCreate, triggerControllerFindAll, triggerControllerRemove } from '../../api/v1/trigger'
import { AppSchema } from '../../schema/app'
import * as Table from 'cli-table3'
import { getEmoji } from '../../util/print'
import { formatDate } from '../../util/format'

export async function list(): Promise<void> {
  const appSchema = AppSchema.read()
  const triggers = await triggerControllerFindAll(appSchema.appid)
  const table = new Table({
    head: ['id', 'name', 'target', 'cron', 'createdAt'],
  })

  for (const trigger of triggers) {
    table.push([trigger._id, trigger.desc, trigger.target, trigger.cron, formatDate(trigger.createdAt)])
  }
  console.log(table.toString())
}

export async function create(name: string, target: string, cron: string): Promise<void> {
  const appSchema = AppSchema.read()

  const createDto: CreateTriggerDto = {
    desc: name,
    target,
    cron,
  }
  await triggerControllerCreate(appSchema.appid, createDto)
  console.log(`${getEmoji('✅')} trigger "${name}" created`)
}

export async function del(options: { id?: string; name?: string }): Promise<void> {
  const appSchema = AppSchema.read()
  if (options.id) {
    await triggerControllerRemove(options.id, appSchema.appid)
    console.log(`${getEmoji('✅')} trigger "${options.id}" deleted`)
  } else if (options.name) {
    const triggers = await triggerControllerFindAll(appSchema.appid)
    const trigger = triggers.find((t) => t.desc === options.name)
    if (trigger) {
      await triggerControllerRemove(trigger._id, appSchema.appid)
      console.log(`${getEmoji('✅')} trigger "${options.name}" deleted`)
    } else {
      console.log(`${getEmoji('❌')} trigger "${options.name}" not found`)
    }
  }
}
