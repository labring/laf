import { bucketControllerFindAll } from '../../api/v1/storage'
import { AppSchema } from '../../schema/app'
import { DeploySchema } from '../../schema/deploy'
import { pushAll as pushAllFunctions } from '../function'
import { create as createBucket, push as pushBucket } from '../storage'
import { create as createWebsite } from '../website'
import { push as pushDependency } from '../dependency'
import { pullAll as pullAllPolicies } from '../policy'
import { getEmoji } from '../../util/print'
import { websiteControllerFindAll } from '../../api/v1/websitehosting'

export async function deploy() {
  if (!DeploySchema.exist()) {
    console.log('deploy.yaml not exist, please create it first')
    return
  }

  const appSchema = AppSchema.read()
  const deploySchema = DeploySchema.read()

  // install dependencies
  await pushDependency({ updatePackage: true })

  // push all functions
  await pushAllFunctions({ force: true })

  // push all policies
  await pullAllPolicies()

  // create bucket if not exist
  if (deploySchema?.resources?.buckets) {
    const buckets = await bucketControllerFindAll(appSchema.appid)
    const bucketMap = new Map<string, string>()
    buckets.forEach((bucket) => {
      bucketMap.set(bucket.shortName, bucket.name)
    })

    for (const bucket of deploySchema?.resources?.buckets) {
      if (!bucketMap.has(bucket.name)) {
        await createBucket(bucket.name, { policy: bucket.policy })
      } else {
        console.log(`bucket ${bucket.name} already exist, skip`)
      }
    }
  }

  if (deploySchema?.resources?.websites) {
    const websites = await websiteControllerFindAll(appSchema.appid)
    const websiteMap = new Map<string, boolean>()
    websites.forEach((website) => {
      websiteMap.set(website.bucketName, true)
    })

    for (const website of deploySchema?.resources?.websites) {
      if (!websiteMap.has(website.bucketName) && !websiteMap.has(appSchema.appid + '-' + website.bucketName)) {
        await createWebsite(website.bucketName, {})
      } else {
        console.log(`website:${website.bucketName} already exist, skip`)
      }
    }
  }

  if (deploySchema?.actions?.buckets) {
    // push all buckets
    for (const bucket of deploySchema?.actions?.buckets) {
      await pushBucket(bucket.bucketName, bucket.srcDir, { force: true, detail: false })
    }
  }

  console.log(`${getEmoji('🚀')} deploy success`)
}
