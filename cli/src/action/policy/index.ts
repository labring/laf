import { readApplicationConfig } from '../../config/application'
import * as Table from 'cli-table3'
import {
  policyControllerCreate,
  policyControllerFindAll,
  policyControllerRemove,
  policyRuleControllerCreate,
  policyRuleControllerFindAll,
  policyRuleControllerRemove,
  policyRuleControllerUpdate,
} from '../../api/v1/database'
import { formatDate } from '../../util/format'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { POLICIES_DIRECTORY_NAME } from '../../common/constant'
import { writeYamlFile, loadYamlFile } from '../../util/file'
import { CreatePolicyDto, CreatePolicyRuleDto, UpdatePolicyRuleDto } from '../../api/v1/data-contracts'
import { getEmoji } from '../../util/print'
import { getApplicationPath } from '../../util/sys'
import { confirm } from '../../common/prompts'

export async function list() {
  const appConfig = readApplicationConfig()
  const policies = await policyControllerFindAll(appConfig.appid)
  const table = new Table({
    head: ['name', 'ruleCount', 'createdAt'],
  })
  for (let item of policies) {
    table.push([item.name, item.rules?.length, formatDate(item.createdAt)])
  }
  console.log(table.toString())
}

export async function pullOne(policyName: string) {
  await pull(policyName)
  console.log(`${getEmoji('✅')} pull policy ${policyName} success`)
}

export async function pullAll() {
  const appConfig = readApplicationConfig()
  const policies = await policyControllerFindAll(appConfig.appid)

  for (let item of policies) {
    await pull(item.name)
  }

  console.log(`${getEmoji('✅')} pull all policies success`)
}

async function pull(policyName: string) {
  const appConfig = readApplicationConfig()
  const rules = await policyRuleControllerFindAll(appConfig.appid, policyName)
  const rulePath = path.join(process.cwd(), POLICIES_DIRECTORY_NAME, policyName + '.yaml')
  const ruleList: PolicyRule[] = []
  for (let item of rules) {
    ruleList.push({
      collectionName: item.collectionName,
      rules: {
        read: item.value.read,
        count: item.value.count,
        update: item.value.update,
        remove: item.value.remove,
        add: item.value.add,
      },
    })
  }
  writeYamlFile(rulePath, ruleList)
}

export async function pushOne(policyName: string) {
  const appConfig = readApplicationConfig()
  const policies = await policyControllerFindAll(appConfig.appid)
  let isCreate = true
  for (let item of policies) {
    if (item.name === policyName) {
      isCreate = false
      break
    }
  }
  await push(policyName, isCreate)
  console.log(`${getEmoji('✅')} push policy ${policyName} success`)
}

export async function pushAll(options: { force: boolean }) {
  const appConfig = readApplicationConfig()

  // get server policies
  const serverPolicies = await policyControllerFindAll(appConfig.appid)
  const serverPoliciesMap = new Map<string, boolean>()
  for (let item of serverPolicies) {
    serverPoliciesMap.set(item.name, true)
  }

  // get local policies
  const localPolicies = getLocalPolicies()
  const localPoliciesMap = new Map<string, boolean>()
  for (let item of localPolicies) {
    localPoliciesMap.set(item, true)
  }

  // push local policies
  for (let item of localPolicies) {
    await push(item, !serverPoliciesMap.has(item))
  }

  // delete server policies
  for (let item of serverPolicies) {
    if (!localPoliciesMap.has(item.name)) {
      if (options.force) {
        await policyControllerRemove(appConfig.appid, item.name)
      } else {
        const res = await confirm('confirm remove policy ' + item.name + '?')
        if (res.value) {
          await policyControllerRemove(appConfig.appid, item.name)
        } else {
          console.log(`${getEmoji('🎃')} cancel remove policy ${item.name}`)
        }
      }
    }
  }
  console.log(`${getEmoji('✅')} push all policies success`)
}

async function push(policyName: string, isCreate: boolean) {
  const appConfig = readApplicationConfig()
  if (isCreate) {
    const createPolicyDto: CreatePolicyDto = {
      name: policyName,
    }
    await policyControllerCreate(appConfig.appid, createPolicyDto)
  }
  const serverRules = await policyRuleControllerFindAll(appConfig.appid, policyName)
  const serverRulesMap = new Map<string, boolean>()
  for (let item of serverRules) {
    serverRulesMap.set(item.collectionName, true)
  }
  const rulePath = path.join(process.cwd(), POLICIES_DIRECTORY_NAME, policyName + '.yaml')
  const localRules: PolicyRule[] = loadYamlFile(rulePath)
  const localRulesMap = new Map<string, boolean>()

  // update or create rule
  for (let item of localRules) {
    if (serverRulesMap.has(item.collectionName)) {
      // rule exist, update
      const updateRuleDto: UpdatePolicyRuleDto = {
        value: JSON.stringify(item.rules),
      }
      await policyRuleControllerUpdate(appConfig.appid, policyName, item.collectionName, updateRuleDto)
    } else {
      // rule not exist, create
      const createRuleDto: CreatePolicyRuleDto = {
        collectionName: item.collectionName,
        value: JSON.stringify(item.rules),
      }
      await policyRuleControllerCreate(appConfig.appid, policyName, createRuleDto)
    }
    localRulesMap.set(item.collectionName, true)
  }

  // delete rule
  for (let item of serverRules) {
    if (!localRulesMap.has(item.collectionName)) {
      await policyRuleControllerRemove(appConfig.appid, policyName, item.collectionName)
    }
  }
}

function getLocalPolicies(): string[] {
  const dir = path.join(getApplicationPath(), POLICIES_DIRECTORY_NAME)
  const files = fs.readdirSync(dir)
  const policies: string[] = []
  for (let item of files) {
    if (item.endsWith('.yaml')) {
      policies.push(item.replace('.yaml', ''))
    }
  }
  return policies
}
