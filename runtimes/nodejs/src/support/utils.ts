import * as crypto from 'crypto'
import { exec } from 'child_process'
import * as fs from 'fs'
import Module from 'module'
import path from 'path'
import Config from '../config'
import { IRequest } from './types'
import { logger } from './logger'

/**
 * Generate UUID v4
 * @returns
 */
export function generateUUID() {
  return crypto.randomUUID()
}

/**
 * Generate a password
 * @param length the length of password, default is 8
 * @param hasNumbers add numbers to password, [0-9]
 * @param hasSymbols add symbols to password, [!@#$%^&*_-=+]
 * @returns
 */
export function generatePassword(
  length = 8,
  hasNumbers = true,
  hasSymbols = true,
) {
  return generateRandString(length, hasNumbers, hasSymbols)
}

/**
 * Generate a rand string
 * @param length the length of password, default is 8
 * @param hasNumbers add numbers to password, [0-9]
 * @param hasSymbols add symbols to password, [!@#$%^&*_-=+]
 * @returns
 */
export function generateRandString(
  length = 8,
  hasNumbers = true,
  hasSymbols = true,
) {
  const alpha = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*_-=+'

  let chars = alpha
  if (hasNumbers) chars += numbers
  if (hasSymbols) chars += symbols

  let str = ''
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return str
}

export function hashPassword(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Recursively deeply freeze objects
 * @param object
 * @returns
 */
export function deepFreeze(object: object) {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object)

  // Freeze properties before freezing self

  for (const name of propNames) {
    const value = object[name]

    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  }

  return Object.freeze(object)
}

/**
 * nanosecond to ms
 * @param nanoseconds
 * @returns
 */
export function nanosecond2ms(nanoseconds: bigint): number {
  // trim the decimal point by devide 1000
  const _t = nanoseconds / BigInt(1000)

  const ret = parseFloat(_t.toString()) / 1000
  return ret
}

/**
 * sleep
 * @param ms  milliseconds
 * @returns
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * generate md5
 * @param content md5 content
 * @returns
 */
export function md5(content: string) {
  return crypto.createHash('md5').update(content).digest('hex')
}

export function uint8ArrayToBase64(buffer: Uint8Array) {
  return Buffer.from(buffer).toString('base64')
}

export function base64ToUint8Array(base64: string) {
  const buffer = Buffer.from(base64, 'base64')
  return new Uint8Array(buffer)
}

export function GetClientIPFromRequest(req: IRequest) {
  // try to get ip from x-forwarded-for
  const ips_str = req.headers['x-forwarded-for'] as string
  if (ips_str) {
    const ips = ips_str.split(',')
    return ips[0]
  }

  // try to get ip from x-real-ip
  const ip = req.headers['x-real-ip'] as string
  if (ip) {
    return ip
  }

  return null
}

export function installDependency(packageName: string) {
  return new Promise((resolve, reject) => {
    logger.info(`Installing package ${packageName} ...`)
    exec(
      `cd ${Config.CUSTOM_DEPENDENCY_BASE_PATH} && npm install ${packageName}`,
      (error, stdout, stderr) => {
        if (error) {
          logger.error(`Error installing package ${packageName}: ${error}`)
          return reject(error)
        }
        if (stderr) {
          logger.error(`Error installing package ${packageName}: ${stderr}`)
          return reject(new Error(stderr))
        }
        clearModuleCache(packageName)
        logger.info(`Package ${packageName} installed success`)
        resolve(stdout)
      },
    )
  })
}

export function installDependencies(packageName: string[]) {
  return installDependency(packageName.join(' '))
}

export function uninstallDependency(packageName: string) {
  return new Promise((resolve, reject) => {
    logger.info(`Uninstalling package ${packageName} ...`)
    exec(
      `cd ${Config.CUSTOM_DEPENDENCY_BASE_PATH} && npm uninstall ${packageName}`,
      (error, stdout, stderr) => {
        if (error) {
          logger.error(`Error uninstalling package ${packageName}: ${error}`)
          return reject(error)
        }
        if (stderr) {
          logger.error(`Error uninstalling package ${packageName}: ${stderr}`)
          return reject(new Error(stderr))
        }
        clearModuleCache(packageName)
        logger.info(`Package ${packageName} uninstalled success`)
        resolve(stdout)
      },
    )
  })
}

export function uninstallDependencies(packageName: string[]) {
  // the raw name is packageName@version, so we need to trim version
  return uninstallDependency(
    packageName.map((v) => v.slice(0, packageName.indexOf('@', 1))).join(' '),
  )
}

// === clear module cache
const resolveFrom = (fromDirectory: string, moduleId: string) => {
  try {
    fromDirectory = fs.realpathSync(fromDirectory)
  } catch (error) {
    if (error.code === 'ENOENT') {
      fromDirectory = path.resolve(fromDirectory)
    } else {
      throw error
    }
  }

  const fromFile = path.join(fromDirectory, 'noop.js')

  const resolveFileName = () =>
    // @ts-ignore
    Module._resolveFilename(moduleId, {
      id: fromFile,
      filename: fromFile,
      paths: [
        // our custom node_modules
        `${Config.CUSTOM_DEPENDENCY_BASE_PATH}/node_modules`,
        // @ts-ignore
        ...Module._nodeModulePaths(fromDirectory),
      ],
    })

  return resolveFileName()
}

const resolve = (moduleId: string) => {
  try {
    return resolveFrom(path.dirname(parentModule(__filename)), moduleId)
  } catch (_) {}
}

export function callsites() {
  const _prepareStackTrace = Error.prepareStackTrace
  try {
    let result = []
    Error.prepareStackTrace = (_, callSites) => {
      const callSitesWithoutCurrent = callSites.slice(1)
      result = callSitesWithoutCurrent
      return callSitesWithoutCurrent
    }

    new Error().stack
    return result
  } finally {
    Error.prepareStackTrace = _prepareStackTrace
  }
}

function parentModule(filePath: string) {
  const stacks = callsites()

  if (!filePath) {
    return stacks[2].getFileName()
  }

  let hasSeenValue = false

  stacks.shift()

  for (const stack of stacks) {
    const parentFilePath = stack.getFileName()

    if (typeof parentFilePath !== 'string') {
      continue
    }

    if (parentFilePath === filePath) {
      hasSeenValue = true
      continue
    }

    // Skip native modules
    if (parentFilePath === 'module.js') {
      continue
    }

    if (hasSeenValue && parentFilePath !== filePath) {
      return parentFilePath
    }
  }
}

export function clearModuleCache(moduleId: string) {
  const filePath = resolve(moduleId)

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
// ===
