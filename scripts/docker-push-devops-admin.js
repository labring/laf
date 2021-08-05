#! /usr/bin/env node

const fse = require('fs-extra')
const child_process = require('child_process')
const path = require('path')
const { getDevopsAdminVersion, images , pushImage} = require('./utils')

/**
 * main function
 */
function main() {
  const devopsAdminVersion = getDevopsAdminVersion()
  pushImage(`${images.devops_admin}:${devopsAdminVersion}`)
  pushImage(`${images.devops_admin}:latest`)
}

main()
