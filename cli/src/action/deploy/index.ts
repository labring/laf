import { bucketControllerFindAll } from '../../api/v1/storage'
import { AppSchema } from '../../schema/app'
import { DeploySchema } from '../../schema/deploy'
import { pushAll as pushAllFunctions } from '../function'
import { create as createBucket, push as pushBucket } from '../storage'
import { push as pushDependency } from '../dependency'
import { pullAll as pullAllPolicies } from '../policy'
import { getEmoji } from '../../util/print'

export async function deploy() {
  if (!DeploySchema.exist()) {
    console.log('deploy.yaml not exist, please create it first')
    return
  }

  const appSchema = AppSchema.read()
  const deploySchema = DeploySchema.read()

  // install dependencies
  await pushDependency()

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

    for (let bucket of deploySchema?.resources?.buckets) {
      if (!bucketMap.has(bucket.name)) {
        await createBucket(bucket.name, { policy: bucket.policy })
      } else {
        console.log(`${bucket.name} already exist, skip`)
      }
    }
  }

  if (deploySchema?.actions?.buckets) {
    // push all buckets
    for (let bucket of deploySchema?.actions?.buckets) {
      await pushBucket(bucket.bucketName, bucket.srcDir, { force: true, detail: false })
    }
  }
  console.log(`${getEmoji('🚀')} deploy success`)
}
