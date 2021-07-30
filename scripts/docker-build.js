#! /usr/bin/env node

const fse = require('fs-extra')
const child_process = require('child_process')
const path = require('path')
const { getAppServerVersion, getDevopsServerVersion, images , buildImage} = require('./utils')

/**
 * main function
 */
function main() {

  const devopsDockerfile = path.resolve(__dirname, '../packages/devops-server')
  console.log(devopsDockerfile)
  const devopsVersion = getDevopsServerVersion()
  buildImage(devopsDockerfile, `${images.devops}:${devopsVersion}`, `${images.devops}:latest`)

  const appDockerfile = path.resolve(__dirname, '../packages/app-server')
  const appVersion = getAppServerVersion()
  buildImage(appDockerfile, `${images.app}:${appVersion}`, `${images.app}:latest`)
}

main()
