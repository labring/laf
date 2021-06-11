import * as assert from 'assert'
import { Ruler } from 'less-api'
import { accessor, db } from '../db'
import { entry as adminEntry } from '../../router/entry/admin'
import { entry as appEntry } from '../../router/entry/app'

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

/**
 * 应用访问规则
 */
export async function applyRules() {
  // apply admin rules
  {
    const ruler = new Ruler(accessor)
    const rules = await getAccessRules('admin')
    ruler.load(rules)
    adminEntry.setRuler(ruler)
  }

  // apply app rules
  {
    const ruler = new Ruler(accessor)
    const rules = await getAccessRules('app')
    ruler.load(rules)
    appEntry.setRuler(ruler)
  }
}