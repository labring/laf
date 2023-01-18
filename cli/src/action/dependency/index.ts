import * as path from "node:path"
import * as fs  from "node:fs"
import { dependencyControllerGetDependencies } from "../../api/v1/application"
import { PACKAGE_FILE } from "../../common/constant"
import { readApplicationConfig } from "../../config/application"


export async function update() {
  const appConfig = readApplicationConfig()
  const dependencies = await dependencyControllerGetDependencies(appConfig.appid)

  // TODO: update dependencies to package.json
  const packagePath = path.resolve(process.cwd(), PACKAGE_FILE)
  let packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"))
  const devDependencies = {}
  for (let dependency of dependencies) {
    devDependencies[dependency.name] = dependency.spec
  }
  packageJson.devDependencies = devDependencies
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
}