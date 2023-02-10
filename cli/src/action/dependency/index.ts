import * as path from 'node:path'
import * as fs from 'node:fs'
import {
  dependencyControllerAdd,
  dependencyControllerGetDependencies,
  dependencyControllerUpdate,
} from '../../api/v1/application'
import { DEPENDENCY_FILE_NAME, PACKAGE_FILE } from '../../common/constant'
import { readApplicationConfig } from '../../config/application'
import { CreateDependencyDto, UpdateDependencyDto } from '../../api/v1/data-contracts'
import { waitApplicationState } from '../../common/wait'
import { getEmoji } from '../../util/print'
import { loadYamlFile, writeYamlFile } from '../../util/file'

export async function add(dependencyName: string, options: { targetVersion: string }) {
  const appConfig = readApplicationConfig()
  const dependencyDto: CreateDependencyDto = {
    name: dependencyName,
    spec: 'latest',
  }
  if (options.targetVersion) {
    dependencyDto.spec = options.targetVersion
  }
  await dependencyControllerAdd(appConfig.appid, [dependencyDto])
  await waitApplicationState('Running')

  await pullOne()

  console.log(`${getEmoji('✅')} dependency ${dependencyDto.name}:${dependencyDto.spec} installed`)
  console.log(`${getEmoji('👉')} please run \`npm install\` to install dependency`)
}

export async function pull() {
  await pullOne()
  console.log(`${getEmoji('✅')} dependency pulled`)
  console.log(`${getEmoji('👉')} please run 'npm install' install dependencies`)
}

async function pullOne(updateYaml: boolean = true) {
  const appConfig = readApplicationConfig()
  const dependencies = await dependencyControllerGetDependencies(appConfig.appid)

  const packagePath = path.resolve(process.cwd(), PACKAGE_FILE)
  let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  const devDependencies = {}
  const localDependencies = {}
  for (let dependency of dependencies) {
    devDependencies[dependency.name] = dependency.spec

    // add a non-built-in dependency
    if (!dependency.builtin) {
      localDependencies[dependency.name] = dependency.spec
    }
  }
  packageJson.devDependencies = devDependencies
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))

  // write to config
  if (updateYaml) {
    const filePath = path.resolve(process.cwd(), DEPENDENCY_FILE_NAME)
    writeYamlFile(filePath, localDependencies)
  }
}

export async function push() {
  const appConfig = readApplicationConfig()
  const serverDependencies = await dependencyControllerGetDependencies(appConfig.appid)
  const serverDependenciesMap = new Map<string, boolean>()
  for (let item of serverDependencies) {
    serverDependenciesMap.set(item.name, true)
  }
  const filePath = path.resolve(process.cwd(), DEPENDENCY_FILE_NAME)
  const localDependencies = loadYamlFile(filePath)
  for (let key in localDependencies) {
    if (!serverDependenciesMap.has(key)) {
      const createDependencyDto: CreateDependencyDto = {
        name: key,
        spec: localDependencies[key],
      }
      await dependencyControllerAdd(appConfig.appid, [createDependencyDto])
    } else {
      const updateDependencyDto: UpdateDependencyDto = {
        name: key,
        spec: localDependencies[key],
      }
      await dependencyControllerUpdate(appConfig.appid, [updateDependencyDto])
    }
  }
  // update package.json
  await pullOne(false)
  console.log(`${getEmoji('✅')} dependency pushed`)
  console.log(`${getEmoji('👉')} please run 'npm install' install dependencies`)
}
