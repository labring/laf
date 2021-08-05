#! /usr/bin/env node

const fse = require('fs-extra')
const child_process = require('child_process')
const path = require('path')
const { getAppServerVersion, images , pushImage} = require('./utils')

/**
 * main function
 */
function main() {
  const appVersion = getAppServerVersion()
  pushImage(`${images.app}:${appVersion}`)
  pushImage(`${images.app}:latest`)
}

main()
