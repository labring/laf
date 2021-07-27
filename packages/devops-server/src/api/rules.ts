import * as assert from 'assert'
import { Globals } from "../lib/globals"

const db = Globals.sys_db
export interface RuleDocument {
  category: string,
  collection: string,
  data: Object
}

export async function getAccessRules(category: string): Promise<any> {
  const r = await db.collection('rules')
    .where({ category })
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
