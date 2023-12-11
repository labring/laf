import { Injectable, Logger } from '@nestjs/common'
import { RegionService } from '../region/region.service'
import { SystemDatabase } from 'src/system-database'
import { BucketPolicy } from './entities/storage-bucket'
import { BucketService } from './bucket.service'
import { CreateBucketDto } from './dto/create-bucket.dto'
import { S3, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as assert from 'assert'

@Injectable()
export class CloudBinBucketService {
  private readonly logger = new Logger(CloudBinBucketService.name)
  private readonly db = SystemDatabase.db

  constructor(
    // private readonly storageService: StorageService,
    private readonly regionService: RegionService,
    private readonly bucketService: BucketService,
  ) {}

  // get cloud-bin bucket or create it if not exists
  async ensureCloudBinBucket(appid: string) {
    const shortName = `cloud-bin`
    const bucketName = `${appid}-${shortName}`
    const bucket = await this.bucketService.findOne(appid, bucketName)
    if (bucket) {
      return bucket
    }

    // create cloud-bin bucket in db
    const dto = new CreateBucketDto()
    dto.shortName = shortName
    dto.policy = BucketPolicy.private
    const created = await this.bucketService.create(appid, dto)
    this.logger.log(`creating cloud-bin bucket ${bucketName} for app ${appid}`)

    return created
  }

  async createPullUrl(appid: string, filename: string) {
    const bucket = await this.ensureCloudBinBucket(appid)
    const command = new GetObjectCommand({
      Bucket: bucket.name,
      Key: filename,
    })

    const client = await this.getS3Client(appid)
    const url = await getSignedUrl(client, command, {
      expiresIn: 3600 * 24 * 7,
    })

    return url
  }

  async createPushUrl(appid: string, filename: string) {
    const bucket = await this.ensureCloudBinBucket(appid)
    const client = await this.getS3Client(appid)
    const command = new PutObjectCommand({
      Bucket: bucket.name,
      Key: filename,
    })
    const url = await getSignedUrl(client, command, {
      expiresIn: 3600 * 24 * 7,
    })

    return url
  }

  async getS3Client(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    assert(region, `region not found for app ${appid}`)

    const conf = region.storageConf
    // const storage = await this.storageService.findOne(appid)

    const client = new S3({
      region: region.name,
      endpoint: conf.internalEndpoint,
      credentials: {
        accessKeyId: conf.accessKey,
        secretAccessKey: conf.secretKey,
      },
      forcePathStyle: true,
    })

    return client
  }

  async getNodeModulesCachePullUrl(appid: string) {
    return await this.createPullUrl(appid, 'node_modules.tar')
  }

  async getNodeModulesCachePushUrl(appid: string) {
    return await this.createPushUrl(appid, 'node_modules.tar')
  }
}
