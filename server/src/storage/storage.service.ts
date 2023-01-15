import { Injectable, Logger } from '@nestjs/common'
import { Region, StorageUser } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { GenerateAlphaNumericPassword } from 'src/utils/random'
import { MinioService } from './minio/minio.service'
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts'
import { RegionService } from 'src/region/region.service'

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)

  constructor(
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
    private readonly prisma: PrismaService,
  ) {}

  async create(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    const accessKey = appid
    const secretKey = GenerateAlphaNumericPassword(64)

    // create storage user in minio
    const r0 = await this.minioService.createUser(region, accessKey, secretKey)
    if (r0.error) {
      this.logger.error(r0.error)
      return false
    }

    // add storage user to common user group in minio
    const r1 = await this.minioService.addUserToGroup(region, accessKey)
    if (r1.error) {
      this.logger.error(r1.error)
      return false
    }

    // create storage user in database
    const user = await this.prisma.storageUser.create({
      data: {
        accessKey,
        secretKey,
        application: {
          connect: {
            appid: appid,
          },
        },
      },
    })

    return user
  }

  async findOne(appid: string) {
    const user = await this.prisma.storageUser.findUnique({
      where: {
        appid,
      },
    })

    return user
  }

  async delete(appid: string) {
    // TODO: delete user in minio

    const user = await this.prisma.storageUser.delete({
      where: {
        appid,
      },
    })

    return user
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
