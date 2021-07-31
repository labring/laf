#! /usr/bin/env node

const fse = require('fs-extra')
const child_process = require('child_process')
const path = require('path')
const { getAppServerVersion, getDevopsServerVersion, getDevopsAdminVersion, images , buildImage} = require('./utils')

/**
 * main function
 */
function main() {

  const devopsDockerfile = path.resolve(__dirname, '../packages/devops-server')
  const devopsVersion = getDevopsServerVersion()
  buildImage(devopsDockerfile, `${images.devops}:${devopsVersion}`, `${images.devops}:latest`)
}

main()
