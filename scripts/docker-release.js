#! /usr/bin/env node

const assert = require('assert')
const path = require('path')
const { getPackageVersion, images, pushImage, tagImage } = require('./utils')

/**
 * main function
 */
function main() {
  const packageName = process.env.PACKAGE
  assert.ok(packageName, 'packageName got empty')

  const packagePath = path.resolve(__dirname, `../packages/${packageName}`)

  const version = getPackageVersion(packagePath)
  const sourceImage = `${images[packageName]}:${version}`
  const targetImage = `${images[packageName]}:latest`
  tagImage(sourceImage, targetImage)

  pushImage(targetImage)
}

main()
