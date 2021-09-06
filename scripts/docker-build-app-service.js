#! /usr/bin/env node


const path = require('path')
const { getAppServiceVersion, images , buildImage} = require('./utils')

/**
 * main function
 */
function main() {
  const dockerfile = path.resolve(__dirname, '../packages/app-service')
  const version = getAppServiceVersion()
  buildImage(dockerfile, `${images.app_service}:${version}`, `${images.app_service}:latest`)
}

main()
