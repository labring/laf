import { Command } from 'commander'
import { detail } from './api/oss'
import { handlePushCommand, handlePullCommand } from './actions/oss'
import { getAppData } from "./utils/util"

export function makeOssCommand() {
  const oss = new Command('oss')

  oss
    .command('pull')
    .argument('bucket', "bucket")
    .argument('out-path', "out-path")
    .option('-f, --force-overwrite', 'force to  file ignore if modified', false)
    .action(async (bucket, outPath, options) => {
      const appData = getAppData()

      //get bucket detail
      const buckets = await detail(appData.appid, bucket)
      options.outPath = outPath
      options.bucketName = `${appData.appid}-${bucket}`
      options.endpoint = appData.oss_endpoint
      await handlePullCommand(buckets.data.credentials, options)
    })

  oss
    .command('push')
    .argument('input-path', "input-path")
    .argument('bucket', "bucket")
    .option('-f, --force-overwrite', 'force to  file ignore if modified', false)
    .action(async (inputPath, bucket, options) => {
      const appData = getAppData()
      // get bucket detail
      const buckets = await detail(appData.appid, bucket)
      options.source = inputPath
      options.bucketName = `${appData.appid}-${bucket}`
      options.endpoint = appData.oss_endpoint
      await handlePushCommand(buckets.data.credentials, options)
    })

  return oss
}
