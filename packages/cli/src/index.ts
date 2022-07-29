#!/usr/bin/env node

import { ensureHomeConfig } from './utils/util'
// run this first of all
ensureHomeConfig()

import { program } from 'commander'
import { handleLoginCommand } from './actions/user'
import { getApplicationByAppid } from './api/apps'
import { handleInitAppCommand, handleSyncAppCommand } from './actions/init'
import { appStop, appStart, appRestart } from './api/apps'
import { handleAppListCommand } from './actions/app'
import { makeFnCommand } from './functions'
import { makeOssCommand } from './oss'


program
  .option('-v, --version', 'output version')
  .action((options) => {
    if (!options.v) {
      program.outputHelp()
    }
    const version = require('../package.json').version
    console.log('\nVersion:', `v${version}`)
    console.log('\nUpdate laf-cli to latest version:')
    console.log('  npm install -g laf-cli')
  })

program
  .command('login')
  .option('-u, --username <username>', 'username')
  .option('-p, --password <password>', 'password')
  .option('-r, --remote <remote>', 'remote server', "https://console.lafyun.com")
  .action(async (options) => {
    // check params
    const username = options.username
    const password = options.password
    if (!username) {
      console.error('username is required')
      process.exit(1)
    }
    if (!password) {
      console.error('password is required')
      process.exit(1)
    }

    // login
    await handleLoginCommand(options.remote, username, password)
  })


program
  .command('init <appid>')
  .option('-s, --sync', 'sync app', false)
  .action(async (appid, options) => {
    try {
      // get app
      const result = await getApplicationByAppid(appid)
      const endpoint = `${result.data.app_deploy_url_schema}://${appid}.${result.data.app_deploy_host}`
      const oss_endpoint = result.data.oss_external_endpoint

      await handleInitAppCommand(appid, endpoint, oss_endpoint)

      // sync app data
      if (options.sync) {
        //sync app (now only pull function)
        await handleSyncAppCommand(appid)
      }
    } catch (err) {
      console.log(err.message)
    }
  })


program
  .command('list')
  .description('show application list')
  .action(async () => {
    await handleAppListCommand()
  })

program
  .command('stop <appid>')
  .option('--env <env-file>', `the file name to generate`, '.env')
  .action(async (appid) => {
    const response = await appStop(appid)

    if (response.data.result) {
      console.log('stop success')
    } else {
      console.log('stop failed')
    }
  })


program
  .command('start <appid>')
  .action(async (appid) => {
    const response = await appStart(appid)

    if (response.data.result) {
      console.log('start success')
    } else {
      console.log('start failed')
    }
  })


program
  .command('restart <appid>')
  .action(async (appid) => {
    const response = await appRestart(appid)

    if (response.data.result) {
      console.log('restart success')
    } else {
      console.log('restart failed')
    }
  })

program.addCommand(makeFnCommand())
program.addCommand(makeOssCommand())

program.parse(process.argv)

