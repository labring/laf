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
import { getBaseDir } from '../../util/sys'
import { confirm } from '../../common/prompts'
import { AppSchema } from '../../schema/app'

export async function list() {
  const appSchema = AppSchema.read()
  const policies = await policyControllerFindAll(appSchema.appid)
  const table = new Table({
    head: ['name', 'ruleCount', 'createdAt'],
  })
  for (const item of policies) {
    table.push([item.name, item.rules?.length, formatDate(item.createdAt)])
  }
  console.log(table.toString())
}

export async function pullOne(policyName: string) {
  await pull(policyName)
  console.log(`${getEmoji('✅')} pull policy ${policyName} success`)
}

export async function pullAll() {
  const appSchema = AppSchema.read()
  const policies = await policyControllerFindAll(appSchema.appid)

  for (const item of policies) {
    await pull(item.name)
  }

  console.log(`${getEmoji('✅')} pull all policies success`)
}

async function pull(policyName: string) {
  const appSchema = AppSchema.read()
  const rules = await policyRuleControllerFindAll(appSchema.appid, policyName)
  const rulePath = path.join(getBaseDir(), POLICIES_DIRECTORY_NAME, policyName + '.yaml')
  const ruleList: PolicyRule[] = []
  for (const item of rules) {
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
  const appSchema = AppSchema.read()
  const policies = await policyControllerFindAll(appSchema.appid)
  let isCreate = true
  for (const item of policies) {
    if (item.name === policyName) {
      isCreate = false
      break
    }
  }
  await push(policyName, isCreate)
  console.log(`${getEmoji('✅')} push policy ${policyName} success`)
}

export async function pushAll(options: { force: boolean }) {
  const appSchema = AppSchema.read()

  // get server policies
  const serverPolicies = await policyControllerFindAll(appSchema.appid)
  const serverPoliciesMap = new Map<string, boolean>()
  for (const item of serverPolicies) {
    serverPoliciesMap.set(item.name, true)
  }

  // get local policies
  const localPolicies = getLocalPolicies()
  const localPoliciesMap = new Map<string, boolean>()
  for (const item of localPolicies) {
    localPoliciesMap.set(item, true)
  }

  // push local policies
  for (const item of localPolicies) {
    await push(item, !serverPoliciesMap.has(item))
  }

  // delete server policies
  for (const item of serverPolicies) {
    if (!localPoliciesMap.has(item.name)) {
      if (options.force) {
        await policyControllerRemove(appSchema.appid, item.name)
      } else {
        const res = await confirm('confirm remove policy ' + item.name + '?')
        if (res.value) {
          await policyControllerRemove(appSchema.appid, item.name)
        } else {
          console.log(`${getEmoji('🎃')} cancel remove policy ${item.name}`)
        }
      }
    }
  }
  console.log(`${getEmoji('✅')} push all policies success`)
}

async function push(policyName: string, isCreate: boolean) {
  const appSchema = AppSchema.read()
  if (isCreate) {
    const createPolicyDto: CreatePolicyDto = {
      name: policyName,
    }
    await policyControllerCreate(appSchema.appid, createPolicyDto)
  }
  const serverRules = await policyRuleControllerFindAll(appSchema.appid, policyName)
  const serverRulesMap = new Map<string, boolean>()
  for (const item of serverRules) {
    serverRulesMap.set(item.collectionName, true)
  }
  const rulePath = path.join(getBaseDir(), POLICIES_DIRECTORY_NAME, policyName + '.yaml')
  const localRules: PolicyRule[] = loadYamlFile(rulePath)
  const localRulesMap = new Map<string, boolean>()

  // update or create rule
  for (const item of localRules) {
    if (serverRulesMap.has(item.collectionName)) {
      // rule exist, update
      const updateRuleDto: UpdatePolicyRuleDto = {
        value: JSON.stringify(item.rules),
      }
      await policyRuleControllerUpdate(appSchema.appid, policyName, item.collectionName, updateRuleDto)
    } else {
      // rule not exist, create
      const createRuleDto: CreatePolicyRuleDto = {
        collectionName: item.collectionName,
        value: JSON.stringify(item.rules),
      }
      await policyRuleControllerCreate(appSchema.appid, policyName, createRuleDto)
    }
    localRulesMap.set(item.collectionName, true)
  }

  // delete rule
  for (const item of serverRules) {
    if (!localRulesMap.has(item.collectionName)) {
      await policyRuleControllerRemove(appSchema.appid, policyName, item.collectionName)
    }
  }
}

function getLocalPolicies(): string[] {
  const dir = path.join(getBaseDir(), POLICIES_DIRECTORY_NAME)
  const files = fs.readdirSync(dir)
  const policies: string[] = []
  for (const item of files) {
    if (item.endsWith('.yaml')) {
      policies.push(item.replace('.yaml', ''))
    }
  }
  return policies
}
