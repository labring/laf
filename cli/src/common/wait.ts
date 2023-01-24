import { applicationControllerFindOne } from "../api/v1/application";
import { readApplicationConfig } from "../config/application";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const interval: number = 2000; // interval 1000ms
export async function waitApplicationState(targetState: string) {
  const appConfig = readApplicationConfig();
  while (true) {
    const app = await applicationControllerFindOne(appConfig.appid)
    if (app.state === targetState) {
      return
    }
    sleep(interval)
    console.log(`application waiting ${targetState}....`)
  }
}