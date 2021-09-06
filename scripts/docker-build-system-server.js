#! /usr/bin/env node


const path = require('path')
const { getSystemServerVersion, images , buildImage} = require('./utils')

/**
 * main function
 */
function main() {
  const dockerfile = path.resolve(__dirname, '../packages/system-server')
  const version = getSystemServerVersion()
  buildImage(dockerfile, `${images.system_server}:${version}`, `${images.system_server}:latest`)
}

main()
