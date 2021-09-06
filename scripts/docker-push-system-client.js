#! /usr/bin/env node


const { getSystemClientVersion, images , pushImage} = require('./utils')

/**
 * main function
 */
function main() {
  const version = getSystemClientVersion()
  pushImage(`${images.system_client}:${version}`)
  pushImage(`${images.system_client}:latest`)
}

main()
