import * as path from "node:path"
import * as fs from "node:fs"
import { dependencyControllerAdd, dependencyControllerGetDependencies } from "../../api/v1/application"
import { PACKAGE_FILE } from "../../common/constant"
import { readApplicationConfig } from "../../config/application"
import { CreateDependencyDto } from "../../api/v1/data-contracts"
import { waitApplicationState } from "../../common/wait"
import { getEmoji } from "../../util/print"


export async function add(dependencyName: string, options: { version: string }) {
  const appConfig = readApplicationConfig()
  const dependencyDto: CreateDependencyDto = {
    name: dependencyName,
    spec: 'latest',
  }
  if (options.version) {
    dependencyDto.spec = options.version
  }
  await dependencyControllerAdd(appConfig.appid, [dependencyDto])
  await waitApplicationState('Running')

  await update()

  console.log(`${getEmoji('✅')} dependency ${dependencyDto.name}:${dependencyDto.spec} installed`)
  console.log(`${getEmoji('👉')} please run \`npm install\` to install dependency`)

}


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