#! /usr/bin/env node

const fse = require('fs-extra')
const child_process = require('child_process')
const path = require('path')
const { getAppServerVersion, images , buildImage} = require('./utils')

/**
 * main function
 */
function main() {
  const appDockerfile = path.resolve(__dirname, '../packages/app-server')
  const appVersion = getAppServerVersion()
  buildImage(appDockerfile, `${images.app}:${appVersion}`, `${images.app}:latest`)
}

main()
