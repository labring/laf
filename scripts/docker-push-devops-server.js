#! /usr/bin/env node

const fse = require('fs-extra')
const child_process = require('child_process')
const path = require('path')
const { getDevopsServerVersion, images , pushImage} = require('./utils')

/**
 * main function
 */
function main() {
  const devopsVersion = getDevopsServerVersion()
  pushImage(`${images.devops}:${devopsVersion}`)
  pushImage(`${images.devops}:latest`)
}

main()
