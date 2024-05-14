import { exec } from 'child_process'
import * as fs from 'fs'
import Module from 'module'
import path from 'path'
import Config from '../config'
import { logger } from './logger'
import {
  CUSTOM_DEPENDENCY_NODE_MODULES_PATH,
  FunctionModule,
} from './engine/module'

// === override to disable cache
// @ts-ignore
const originModuleStat = Module._stat
// @ts-ignore
Module._stat = (filename: string) => {
  if (!filename.startsWith(CUSTOM_DEPENDENCY_NODE_MODULES_PATH)) {
    return originModuleStat(filename)
  }
  filename = path.toNamespacedPath(filename)

  let stat
  try {
    stat = fs.statSync(filename)
  } catch (e) {
    return -2 // not found
  }
  if (stat.isDirectory()) {
    return 1
  }
  return 0
}

// @ts-ignore
const originModuleReadPackage = Module._readPackage
// @ts-ignore
Module._readPackage = (requestPath: string) => {
  const pkg = originModuleReadPackage(requestPath)
  if (
    pkg.exists === false &&
    pkg.pjsonPath.startsWith(CUSTOM_DEPENDENCY_NODE_MODULES_PATH)
  ) {
    try {
      const _pkg = JSON.parse(fs.readFileSync(pkg.pjsonPath, 'utf8'))
      pkg.main = _pkg.main
      pkg.exists = true
    } catch {}
  }
  return pkg
}
// ===

export function clearModuleCache(moduleId: string) {
  let filePath: string

  try {
    filePath = FunctionModule.customRequire.resolve(moduleId)
  } catch {}

  if (!filePath) {
    return
  }

  // Delete itself from module parent
  if (require.cache[filePath] && require.cache[filePath].parent) {
    let i = require.cache[filePath].parent.children.length

    while (i--) {
      if (require.cache[filePath].parent.children[i].id === filePath) {
        require.cache[filePath].parent.children.splice(i, 1)
      }
    }
  }

  // Remove all descendants from cache as well
  if (require.cache[filePath]) {
    const children = require.cache[filePath].children.map((child) => child.id)

    // Delete module from cache
    delete require.cache[filePath]

    for (const id of children) {
      clearModuleCache(id)
    }
  }
}

const getPackageNameWithoutVersion = (name: string) =>
  name.slice(0, name.indexOf('@', 1))

export function installDependency(packageName: string) {
  return new Promise((resolve, reject) => {
    logger.info(`Installing package ${packageName} ...`)
    exec(
      `cd ${Config.CUSTOM_DEPENDENCY_BASE_PATH} && npm install ${packageName}`,
      (error, stdout) => {
        if (error) {
          logger.error(`Error installing package ${packageName}: ${error}`)
          return reject(error)
        }
        // if (stderr) {
        //   logger.error(`Error installing package ${packageName}: ${stderr}`)
        //   return reject(new Error(stderr))
        // }
        logger.info(`Package ${packageName} installed success`)
        resolve(stdout)

        exec(
          `cd ${
            Config.CUSTOM_DEPENDENCY_BASE_PATH
          } && sh ${process.cwd()}/upload-dependencies.sh ${
            Config.CUSTOM_DEPENDENCY_BASE_PATH
          } > /dev/null 2>&1`,
        )
      },
    )
  })
}

export function installDependencies(packageName: string[]) {
  return installDependency(packageName.join(' '))
    .catch(() => {})
    .finally(() => {
      packageName.forEach((v) => {
        clearModuleCache(getPackageNameWithoutVersion(v))
      })
    })
}

export function uninstallDependency(packageName: string) {
  return new Promise((resolve, reject) => {
    logger.info(`Uninstalling package ${packageName} ...`)
    exec(
      `cd ${Config.CUSTOM_DEPENDENCY_BASE_PATH} && npm uninstall ${packageName}`,
      (error, stdout) => {
        if (error) {
          logger.error(`Error uninstalling package ${packageName}: ${error}`)
          return reject(error)
        }
        // if (stderr) {
        //   logger.error(`Error uninstalling package ${packageName}: ${stderr}`)
        //   return reject(new Error(stderr))
        // }
        logger.info(`Package ${packageName} uninstalled success`)
        resolve(stdout)

        exec(
          `cd ${
            Config.CUSTOM_DEPENDENCY_BASE_PATH
          } && sh ${process.cwd()}/upload-dependencies.sh ${
            Config.CUSTOM_DEPENDENCY_BASE_PATH
          } > /dev/null 2>&1`,
        )
      },
    )
  })
}

export function uninstallDependencies(packageName: string[]) {
  packageName.forEach((v) => clearModuleCache(getPackageNameWithoutVersion(v)))

  return uninstallDependency(
    packageName.map((v) => getPackageNameWithoutVersion(v)).join(' '),
  )
    .catch(() => {})
    .finally(() => {
      packageName.forEach((v) =>
        clearModuleCache(getPackageNameWithoutVersion(v)),
      )
    })
}
