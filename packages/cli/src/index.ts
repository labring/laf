#!/usr/bin/env node

import { program } from 'commander'
import * as dotenv from 'dotenv'
import { resolve } from 'node:path'
import { handleSyncCommand } from './sync'
import * as fs from 'node:fs'

// laf-cli sync 
program
  .command('sync <source>')
  .description(`sync files to bucket`)
  .option('-e, --endpoint <endpoint>', 'oss endpoint, default is https://oss.lafyun.com, could be override by env OSS_ENDPOINT')
  .option('-k, --access-key <access-key>', 'app oss access-key, default is env OSS_ACCESS_KEY')
  .option('-s, --access-secret <access-secret>', 'app oss access-secret, default is env OSS_ACCESS_SECRET')
  .option('-b, --bucket-name <bucket-name>', 'bucket-name, default is env OSS_BUCKET_NAME')
  .option('-r, --region <region>', 'region', 'cn-default')
  .option('-d, --dry-run', 'dry-run mode', false)
  .option('-f, --force', 'force to updated all files ignore if modified', false)
  .option('--env <env-file>', `your can specify a env file`, '.env')
  .action(async (source, options) => {
    dotenv.config({ path: resolve(process.cwd(), options.env) })

    const endpoint = options.endpoint || process.env.OSS_ENDPOINT || 'https://oss.lafyun.com'
    const accessKey = options.accessKey || process.env.OSS_ACCESS_KEY
    const accessSecret = options.accessSecret || process.env.OSS_ACCESS_SECRET
    const bucketName = options.bucketName || process.env.OSS_BUCKET_NAME
    const region = options.region || process.env.OSS_REGION
    const dryRun = options.dryRun || false
    const force = options.force || false

    if(!endpoint) {
      console.error('endpoint is required')
      process.exit(1)
    }

    if(!accessKey) {
      console.error('accessKey is required')
      process.exit(1)
    }

    if(!accessSecret) {
      console.error('accessSecret is required')
      process.exit(1)
    }

    if(!bucketName) {
      console.error('bucketName is required')
      process.exit(1)
    }

    await handleSyncCommand(source, { endpoint, accessKey, accessSecret, bucketName, dryRun, force, region })
  })

program
  .command('init')
  .description('generate or update .env file')
  .option('-e, --endpoint <endpoint>', 'oss endpoint, default is https://oss.lafyun.com, could be override by env OSS_ENDPOINT')
  .option('-k, --access-key <access-key>', 'app oss access-key, default is env OSS_ACCESS_KEY')
  .option('-s, --access-secret <access-secret>', 'app oss access-secret, default is env OSS_ACCESS_SECRET')
  .option('-b, --bucket-name <bucket-name>', 'bucket-name, default is env OSS_BUCKET_NAME')
  .option('-r, --region <region>', 'region', 'cn-default')
  .option('--env <env-file>', `the file name to generate`, '.env')
  .action(async (options) => {
    const envFile = resolve(process.cwd(), options.env)
    dotenv.config({ path: envFile})

    const endpoint = options.endpoint || process.env.OSS_ENDPOINT || 'https://oss.lafyun.com'
    const accessKey = options.accessKey || process.env.OSS_ACCESS_KEY || ''
    const accessSecret = options.accessSecret || process.env.OSS_ACCESS_SECRET || ''
    const bucketName = options.bucketName || process.env.OSS_BUCKET_NAME || ''
    const region = options.region || process.env.OSS_REGION

    const content = `OSS_ENDPOINT=${endpoint}
OSS_ACCESS_KEY=${accessKey}
OSS_ACCESS_SECRET=${accessSecret}
OSS_BUCKET_NAME=${bucketName}
OSS_REGION=${region}`

    fs.writeFileSync(envFile, content)
    console.log(`Generated: ${envFile}`)
  })

  
program
  .option('-v, --version', 'output version')
  .action((options) => {
    if(!options.v) {
      program.outputHelp()
    }
    const version = require('../package.json').version
    console.log('\nVersion:', `v${version}`)
    console.log('\nUpdate laf-cli to latest version:')
    console.log('  npm install -g laf-cli')
  })

program.parse(process.argv)

