import { Injectable, Logger } from '@nestjs/common'
import { GenerateAlphaNumericPassword } from 'src/utils/random'
import { MinioService } from './minio/minio.service'
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts'
import { RegionService } from 'src/region/region.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { Region } from 'src/region/entities/region'
import { SystemDatabase } from 'src/system-database'
import {
  StoragePhase,
  StorageState,
  StorageUser,
} from './entities/storage-user'
import { StorageBucket } from './entities/storage-bucket'

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
  ) {}

  async create(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    const accessKey = appid
    const secretKey = GenerateAlphaNumericPassword(64)

    // create storage user in minio if not exists
    const minioUser = await this.minioService.getUser(region, accessKey)
    if (!minioUser) {
      const res = await this.minioService.createUser(
        region,
        accessKey,
        secretKey,
      )
      if (res.error) {
        this.logger.error(res.error)
        return null
      }
    }

    // add storage user to common user group in minio
    const res = await this.minioService.addUserToGroup(region, accessKey)
    if (res.error) {
      this.logger.error(res.error)
      return null
    }

    // create storage user in database
    await this.db.collection<StorageUser>('StorageUser').insertOne({
      appid,
      accessKey,
      secretKey,
      dataSize: 0,
      state: StorageState.Active,
      phase: StoragePhase.Created,
      lockedAt: TASK_LOCK_INIT_TIME,
      updatedAt: new Date(),
      createdAt: new Date(),
    })

    return await this.findOne(appid)
  }

  async findOne(appid: string) {
    const user = await this.db
      .collection<StorageUser>('StorageUser')
      .findOne({ appid })

    return user
  }

  async deleteUsersAndBuckets(appid: string) {
    // delete user in minio
    const region = await this.regionService.findByAppId(appid)

    // delete buckets & files
    const count = await this.db
      .collection<StorageBucket>('StorageBucket')
      .countDocuments({ appid })
    if (count > 0) {
      await this.db
        .collection<StorageBucket>('StorageBucket')
        .updateMany(
          { appid, state: { $ne: StorageState.Deleted } },
          { $set: { state: StorageState.Deleted, updatedAt: new Date() } },
        )

      // just return to wait for buckets deletion
      return
    }

    // delete user in minio
    await this.minioService.deleteUser(region, appid)

    // delete user in database
    const res = await this.db
      .collection<StorageUser>('StorageUser')
      .findOneAndDelete({ appid })

    return res.value
  }

  /**
   * Create s3 client of application
   * @param app
   * @returns
   */
  private getSTSClient(region: Region, user: StorageUser) {
    return new STSClient({
      endpoint: region.storageConf.externalEndpoint,
      credentials: {
        accessKeyId: user.accessKey,
        secretAccessKey: user.secretKey,
      },
      region: region.name,
    })
  }

  /**
   * Generate application full-granted OSS STS
   * @param bucket
   * @param duration_seconds
   * @returns
   */
  public async getOssSTS(
    region: Region,
    appid: string,
    user: StorageUser,
    duration_seconds?: number,
  ) {
    const exp = duration_seconds || 3600 * 24 * 7
    const s3 = this.getSTSClient(region, user)
    const policy = await this.getSTSPolicy()
    const cmd = new AssumeRoleCommand({
      DurationSeconds: exp,
      Policy: policy,
      RoleArn: 'arn:xxx:xxx:xxx:xxxx',
      RoleSessionName: appid,
    })

    return await s3.send(cmd)
  }

  async getSTSPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: `app-sts-full-grant`,
          Effect: 'Allow',
          Action: 's3:*',
          Resource: 'arn:aws:s3:::*',
        },
      ],
    }
    return JSON.stringify(policy)
  }
}
