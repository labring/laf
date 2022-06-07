#! /usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const path = require('path')
const { getPackageVersion, images, buildImage, pushImage, tagImage } = require('./utils')


program
  .command('build <package>')
  .description('build a docker image for package')
  .option('-t, --tag [tag]', 'tag to use for the image, defaults to the package version')
  .option('-f, --force', 'force build')
  .option('-d, --dry-run', 'dry run')
  .option('-l, --latest', 'build latest tag')
  .option('-p, --push', 'push image')
  .action(buildPackage)

program
  .command('push <package>')
  .description('push a docker image for package')
  .option('-t, --tag [tag]', 'tag to use for the image, defaults to the package version')
  .option('-f, --force', 'force push')
  .option('-d, --dry-run', 'dry run')
  .option('-l, --latest', 'push latest tag')
  .action(pushPackage)

program
  .command('build-all')
  .description('build all package images which version matches the tag')
  .option('-t, --tag [tag]', 'tag to use for the image, defaults to the root project version')
  .option('-d, --dry-run', 'dry run')
  .option('-l, --latest', 'build latest tag')
  .action(function (options) {

    const lernaPath = path.resolve(__dirname, '../lerna.json')
    const lernaVersion = require(lernaPath)?.version
    const tag = options?.tag || lernaVersion
    const dryRun = options?.dryRun || false

    if (dryRun) console.log('Running in `DRY-RUN` mode')

    const packages = Object.keys(images)
    const matchedPackages = packages.filter(pkg => {
      const packagePath = path.resolve(__dirname, `../packages/${pkg}`)
      const version = getPackageVersion(packagePath)
      return version === tag
    })

    if (matchedPackages.length === 0) return console.error(`No packages found with version ${tag}`)

    for (const pkg of matchedPackages) {
      buildPackage(pkg, { tag, dryRun, latest: options?.latest })
    }
  })

program
  .command('push-all')
  .description('push all package images which version matches the tag')
  .option('-t, --tag [tag]', 'tag to use for the image, defaults to the root project version')
  .option('-d, --dry-run', 'dry run')
  .option('-l, --latest', 'push latest tag')
  .action(function (options) {

    const lernaPath = path.resolve(__dirname, '../lerna.json')
    const lernaVersion = require(lernaPath)?.version
    const tag = options?.tag || lernaVersion
    const dryRun = options?.dryRun || false

    if (dryRun) console.log('Running in `DRY-RUN` mode')

    const packages = Object.keys(images)
    const matchedPackages = packages.filter(pkg => {
      const packagePath = path.resolve(__dirname, `../packages/${pkg}`)
      const version = getPackageVersion(packagePath)
      return version === tag
    })

    if (matchedPackages.length === 0) return console.error(`No packages found with version ${tag}`)

    for (const pkg of matchedPackages) {
      pushPackage(pkg, { tag, dryRun, latest: options?.latest })
    }
  })

program.parse(process.argv);


async function buildPackage(package, options) {
  console.log(`--------------------------- build --------------------------`)
  const packagePath = path.resolve(__dirname, `../packages/${package}`)
  const version = getPackageVersion(packagePath)
  if (!version) return console.error(`No version found for ${package}`)

  const tag = options?.tag || version
  const dryRun = options?.dryRun || false

  const image = `${images[package]}:${tag}`

  if (tag !== version && !options?.force) {
    console.error(`Tag ${tag} does not match version ${version}, use --force to override`)
    return process.exit(1)
  }

  console.log(`Building ${image}`)
  if (!dryRun) {
    await buildImage(packagePath, image)
  }

  if (options?.latest) {
    console.log(`Tagging latest image ${image} -> ${images[package]}:latest`)
    if (!dryRun) await tagImage(image, `${images[package]}:latest`)
  }
}

async function pushPackage(package, options) {
  console.log(`--------------------------- push ---------------------------`)
  const packagePath = path.resolve(__dirname, `../packages/${package}`)
  const version = getPackageVersion(packagePath)
  if (!version) return console.error(`No version found for ${package}`)

  const tag = options?.tag || version
  const dryRun = options?.dryRun || false

  const image = `${images[package]}:${tag}`

  if (tag !== version && !options?.force) {
    console.error(`Tag ${tag} does not match package version ${version}, use --force to override`)
    return process.exit(1)
  }

  console.log(`Pushing ${image}`)
  if (!dryRun) {
    await pushImage(image)
  }

  if (options?.latest) {
    console.log(`Pushing latest tag ${images[package]}:latest`)
    if (!dryRun) await pushImage(`${images[package]}:latest`)
  }
}

