import { getExtraPackages, initCloudSdkPackage, installPackages, moduleExists } from "./api/init"


async function main() {
  const packages = await getExtraPackages()
  if (!packages.length) {
    console.log('no extra packages found')
    return 0
  }

  console.log('packages loaded: ', packages)

  const not_exists = packages.filter(pkg => !moduleExists(pkg.name))
  if (!not_exists.length) {
    console.log('no new packages to be installed')
    return 0
  }

  try {
    const res = installPackages(packages)
    console.log(res)

    initCloudSdkPackage()
  } catch (error) {
    console.error(error)
    return 1
  }

  return 0
}


main().then(code => {
  process.exit(code)
})