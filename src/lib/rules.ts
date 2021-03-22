import * as assert from 'assert'
import { AccessorInterface, getDb } from 'less-api/dist'

export interface RuleDocument {
  category: string,
  collection: string,
  data: Object
}

export async function getAccessRules(category: string, accessor: AccessorInterface): Promise<any> {
  const db = getDb(accessor)
  const r = await db.collection('rules')
    .where({
      category
    })
    .get()

  assert.ok(r.ok && r.data.length, `read rules failed: ${category}`)

  const rules = r.data

  const ruleMap = {}
  for (const rule of rules) {
    const key = rule['collection']
    ruleMap[key] = JSON.parse(rule['data'])
  }

  return ruleMap
}