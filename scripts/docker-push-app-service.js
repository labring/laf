#! /usr/bin/env node


const { getAppServiceVersion, images , pushImage} = require('./utils')

/**
 * main function
 */
function main() {
  const version = getAppServiceVersion()
  pushImage(`${images.app_service}:${version}`)
  pushImage(`${images.app_service}:latest`)
}

main()
