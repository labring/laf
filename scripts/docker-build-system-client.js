#! /usr/bin/env node

const path = require('path')
const { getSystemClientVersion, images , buildImage} = require('./utils')

/**
 * main function
 */
function main() {
  const dockerfile = path.resolve(__dirname, '../packages/system-client')
  const version = getSystemClientVersion()
  buildImage(dockerfile, `${images.system_client}:${version}`, `${images.system_client}:latest`)
}

main()
