import { applicationControllerFindOne } from '../api/v1/application'
import { AppSchema } from '../schema/app'

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const interval = 2000 // interval 1000ms
export async function waitApplicationState(targetState: string) {
  const appSchema = AppSchema.read()
  while (true) {
    const app = await applicationControllerFindOne(appSchema.appid)
    if (app.state === targetState) {
      return
    }
    sleep(interval)
    console.log(`application waiting ${targetState}....`)
  }
}
