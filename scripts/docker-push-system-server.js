#! /usr/bin/env node


const { getSystemServerVersion, images , pushImage} = require('./utils')

/**
 * main function
 */
function main() {
  const version = getSystemServerVersion()
  pushImage(`${images.system_server}:${version}`)
  pushImage(`${images.system_server}:latest`)
}

main()
