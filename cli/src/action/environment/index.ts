import { environmentVariableControllerGet, environmentVariableControllerUpdateAll } from '../../api/v1/application'
import { AppSchema } from '../../schema/app'
import { EnvironmentSchema } from '../../schema/environment'
import { getEmoji } from '../../util/print'

export async function pull(): Promise<void> {
  const appSchema = AppSchema.read()
  const env = await environmentVariableControllerGet(appSchema.appid)
  EnvironmentSchema.write(env)
  console.log(`${getEmoji('✅')} env pulled`)
}

export async function push(): Promise<void> {
  const appSchema = AppSchema.read()
  const env = EnvironmentSchema.read()
  await environmentVariableControllerUpdateAll(appSchema.appid, env)
  console.log(`${getEmoji('✅')} env pushed`)
}
