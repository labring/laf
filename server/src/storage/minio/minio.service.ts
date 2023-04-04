import { Injectable, Logger } from '@nestjs/common'
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteBucketPolicyCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutBucketVersioningCommand,
  S3,
} from '@aws-sdk/client-s3'
import { BucketPolicy, Region } from '@prisma/client'
import * as assert from 'node:assert'
import * as cp from 'child_process'
import { promisify } from 'util'
import { MinioCommandExecOutput } from './types'
import { MINIO_COMMON_USER_GROUP } from 'src/constants'
import { RegionService } from 'src/region/region.service'

const exec = promisify(cp.exec)

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name)

  constructor(private readonly regionService: RegionService) {
    this.regionService.findAll().then(async (regions) => {
      for (const region of regions) {
        const res = await this.setMinioClientTarget(region)
        if (res.status === 'success') {
          this.logger.log('minio alias init - ' + region.name + ' success')
        } else {
          this.logger.log('minio alias init ' + region.name + ' failed')
          this.logger.debug(res)
        }
      }
    })
  }

  /**
   * Create s3 client
   * @returns
   */
  getClient(region: Region) {
    const conf = region.storageConf

    return new S3({
      endpoint: conf.controlEndpoint,
      credentials: {
        accessKeyId: conf.accessKey,
        secretAccessKey: conf.secretKey,
      },
      forcePathStyle: true,
      region: region.name,
    })
  }

  /**
   * Create a minio user
   */
  public async createUser(region: Region, username: string, password: string) {
    assert.ok(username, 'empty username got')
    assert.ok(password, 'empty password got')

    const target = region.name

    const sub_cmd = `admin user add ${target} ${username} ${password}`
    return await this.executeMinioClientCmd(sub_cmd)
  }

  /**
   * Execute minio client command
   */
  public async getUser(region: Region, username: string) {
    assert.ok(username, 'empty username got')

    const target = region.name
    const sub_cmd = `admin user info ${target} ${username}`
    const res = await this.executeMinioClientCmd(sub_cmd)
    if (res.status !== 'success') return null
    return res
  }

  /**
   * Delete a minio user
   */
  public async deleteUser(region: Region, username: string) {
    assert.ok(username, 'empty username got')

    const target = region.name
    const sub_cmd = `admin user remove ${target} ${username}`
    return await this.executeMinioClientCmd(sub_cmd)
  }

  /**
   * Add user to group
   */
  public async addUserToGroup(region: Region, username: string) {
    assert.ok(username, 'empty username got')

    const target = region.name
    const sub_cmd = `admin group add ${target} ${MINIO_COMMON_USER_GROUP} ${username}`
    return await this.executeMinioClientCmd(sub_cmd)
  }

  /**
   * Create a bucket
   */
  public async createBucket(
    region: Region,
    bucket: string,
    policy: BucketPolicy,
  ) {
    assert.ok(bucket, 'empty bucket name got')

    const s3 = this.getClient(region)
    const cmd = new CreateBucketCommand({
      Bucket: bucket,
      CreateBucketConfiguration: {
        LocationConstraint: region.name,
      },
    })
    const res = await s3.send(cmd)
    if (res?.$metadata?.httpStatusCode === 200) {
      await this.updateBucketPolicy(region, bucket, policy)
    }

    const version_res = await s3.send(
      new PutBucketVersioningCommand({
        Bucket: bucket,
        VersioningConfiguration: {
          Status: 'Enabled',
        },
      }),
    )
    if (version_res?.$metadata?.httpStatusCode === 200) {
      this.logger.debug(`bucket ${bucket} versioning enabled`)
    }

    return res
  }

  /**
   * Update bucket policy
   */
  public async updateBucketPolicy(
    region: Region,
    bucket: string,
    policy: BucketPolicy,
  ) {
    assert.ok(region, 'empty region got')
    assert.ok(bucket, 'empty bucket name got')

    const s3 = this.getClient(region)
    if (policy === BucketPolicy.private) {
      const cmd = new DeleteBucketPolicyCommand({ Bucket: bucket })
      return await s3.send(cmd)
    }

    let policyStr = ''
    if (policy === BucketPolicy.readonly) {
      policyStr = await this.getReadonlyPolicy(bucket)
    }
    if (policy === BucketPolicy.readwrite) {
      policyStr = await this.getPublicPolicy(bucket)
    }

    const cmd = new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: policyStr,
    })
    return await s3.send(cmd)
  }

  /**
   * Get bucket stats
   */
  public async statsBucket(region: Region, bucket: string) {
    assert.ok(bucket, 'empty bucket name got')

    type GetBucketUsedSizeOutput = {
      prefix: string
      size: number
      objects: number
      isVersions: boolean
    } & MinioCommandExecOutput

    const sub_cmd = `du ${region.name}/${bucket}`

    const res = await this.executeMinioClientCmd(sub_cmd)
    return res as GetBucketUsedSizeOutput
  }

  /**
   * Delete bucket
   */
  public async forceDeleteBucket(region: Region, bucket: string) {
    assert.ok(bucket, 'empty bucket name got')

    const target = region.name
    const sub_cmd = `rb --force ${target}/${bucket}`
    return await this.executeMinioClientCmd(sub_cmd)
  }

  /**
   * Delete bucket
   */
  public async deleteBucket(region: Region, bucket: string) {
    assert.ok(bucket, 'empty bucket name got')

    const s3 = this.getClient(region)
    const cmd = new DeleteBucketCommand({ Bucket: bucket })
    return await s3.send(cmd)
  }

  /**
   * Head bucket, check if bucket exists
   */
  public async headBucket(region: Region, bucket: string) {
    assert.ok(bucket, 'empty bucket name got')
    const s3 = this.getClient(region)
    const cmd = new HeadBucketCommand({ Bucket: bucket })
    try {
      await s3.send(cmd)
      return true
    } catch (error) {
      if (error.name === 'NotFound') return false
      throw error
    }
  }

  /**
   * Execute minio client shell
   */
  private async executeMinioClientCmd(
    sub_cmd: string,
  ): Promise<MinioCommandExecOutput> {
    const mc_path = process.env.MINIO_CLIENT_PATH || 'mc'
    const cmd = `${mc_path} ${sub_cmd} --json`

    try {
      const { stdout } = await exec(cmd)
      const json: MinioCommandExecOutput = JSON.parse(stdout)
      return json
    } catch (error) {
      this.logger.error(`failed to exec command: {${cmd}}`, error)
      return {
        status: 'error',
        error: error,
      }
    }
  }

  /**
   * Set minio target
   */
  async setMinioClientTarget(region: Region) {
    const conf = region.storageConf
    const access_key = conf.accessKey
    const access_secret = conf.secretKey
    const endpoint = conf.controlEndpoint
    const target = region.name

    const cmd = `alias set ${target} ${endpoint} ${access_key} ${access_secret}`

    return await this.executeMinioClientCmd(cmd)
  }

  /**
   * Get readonly policy for a bucket
   */
  private async getReadonlyPolicy(bucket: string) {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    }

    return JSON.stringify(policy)
  }

  /**
   * Get public policy for a bucket
   */
  private async getPublicPolicy(bucket: string) {
    const policy = {
      Statement: [
        {
          Action: [
            's3:GetBucketLocation',
            's3:ListBucket',
            's3:ListBucketMultipartUploads',
          ],
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Resource: [`arn:aws:s3:::${bucket}`],
        },
        {
          Action: [
            's3:AbortMultipartUpload',
            's3:DeleteObject',
            's3:GetObject',
            's3:ListMultipartUploadParts',
            's3:PutObject',
          ],
          Effect: 'Allow',
          Principal: {
            AWS: ['*'],
          },
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
      Version: '2012-10-17',
    }

    return JSON.stringify(policy)
  }
}
