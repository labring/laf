#! /usr/bin/env node

const { FunctionLoader } = require('./func-loader')
const adminRules = require('./policies/app-admin.json')
const userRules = require('./policies/app-user.json')
const { ObjectId } = require('mongodb')

async function main() {
  const functions = await loadBuiltinFunctions()

  const adminPolicy = getInitialPolicy('admin', adminRules, 'injector-admin')
  const userPolicy = getInitialPolicy('user', userRules, null)

  const policies = [adminPolicy, userPolicy]

  const app = {
    meta: {
      name: 'basic_template'
    },
    functions,
    policies
  }

  console.log(JSON.stringify(app))
}

main()

/**
 * get initial policies
 * @param {string} name policy name
 * @param {string} rules policy rules
 * @param {string} injector cloud function id
 * @returns 
 */
function getInitialPolicy(name, rules, injector) {
  return {
    name: name,
    rules: rules,
    status: 1,
    injector: injector,
  }
}

/**
 * get built-in functions
 * @returns 
 */
async function loadBuiltinFunctions() {  
  const loader = new FunctionLoader()
  const funcs = await loader.getFunctions()
  for (const func of funcs) {
    if (!func.triggers?.length) continue
    for (const tri of func.triggers) {
      tri._id = (new ObjectId()).toHexString()
    }
  }
  return funcs
}