import assert = require("assert")
import * as cp from 'child_process'
import { promisify } from 'util'
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts'
import { CreateBucketCommand, DeleteBucketCommand, DeleteBucketPolicyCommand, PutBucketPolicyCommand, PutBucketVersioningCommand, S3 } from '@aws-sdk/client-s3'
import { logger } from "./logger"
import Config from "../config"
import { IApplicationData } from "./application"
import { GB } from "../constants"
const exec = promisify(cp.exec)

export enum BUCKET_ACL {
  private = 'private',
  readonly = 'public-read',
  public = 'public-read-write'
}

type MinioCommandExecOuput = {
  status: "success" | 'error',
  error?: any
  [key: string]: any
}

export class MinioAgent {
  static readonly MC_TARGET = 'oss'

  static readonly BUCKET_ACLS = [
    BUCKET_ACL.private,
    BUCKET_ACL.readonly,
    BUCKET_ACL.public
  ]

  /**
   * Storage API entry point
   */
  get endpoint() {
    return Config.MINIO_CONFIG?.endpoint?.internal
  }

  static async New() {
    const ma = new MinioAgent()
    await ma.mc_set_alias()
    return ma
  }

  /**
   * @deprecated constructor() is unsupported, use `await MinioAgent.New()` instead
   */
  constructor() { }

  /**
   * Create s3 client
   * @returns 
   */
  getClient() {
    return new S3({
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: Config.MINIO_CONFIG.access_key,
        secretAccessKey: Config.MINIO_CONFIG.access_secret
      },
      forcePathStyle: true,
      region: Config.MINIO_CONFIG.region
    })
  }

  /**
   * Create s3 client of application
   * @param app 
   * @returns 
   */
  public getApplicationSTSClient(app: IApplicationData) {
    return new STSClient({
      endpoint: Config.MINIO_CONFIG.endpoint.internal,
      credentials: {
        accessKeyId: app.appid,
        secretAccessKey: app.config.oss_access_secret,
      },
      region: Config.MINIO_CONFIG.region
    })
  }

  /**
   * Generate application full-granted STS 
   * @param app 
   * @param duration_seconds 
   * @returns 
   */
  public async getApplicationSTS(app: IApplicationData, duration_seconds: number) {
    const s3 = this.getApplicationSTSClient(app)
    const policy = await this.getSTSPolicy()
    const cmd = new AssumeRoleCommand({
      DurationSeconds: duration_seconds,
      Policy: policy,
      RoleArn: 'arn:xxx:xxx:xxx:xxxx',
      RoleSessionName: app.appid
    })

    return await s3.send(cmd)
  }

  /**
   * Create a minio user 
   * @param username the username aka access_key
   * @param password the password aka access_secret
   * @returns 
   */
  public async createUser(username: string, password: string) {
    assert.ok(username, 'empty username got')
    assert.ok(password, 'empty password got')

    const sub_cmd = `admin user add ${MinioAgent.MC_TARGET} ${username} ${password}`
    return await this.mc_exec(sub_cmd)
  }

  /**
   * Set an existed policy to the user
   * @param username 
   * @param policy_name 
   * @returns 
   */
  public async setUserPolicy(username: string, policy_name: string) {
    assert.ok(username, 'empty username got')
    assert.ok(policy_name, 'empty policy_name got')

    const sub_cmd = `admin policy set ${MinioAgent.MC_TARGET} ${policy_name} user=${username}`
    return await this.mc_exec(sub_cmd)
  }

  /**
   * add service account to the user
   * @param username 
   * @returns 
   */
  public async addServiceAccount(username: string) {
    assert.ok(username, 'empty username got')
    const sub_cmd = `admin user svcacct add ${MinioAgent.MC_TARGET} ${username}`
    return await this.mc_exec(sub_cmd)
  }

  /**
 * add service account to the user
 * @param username 
 * @returns 
 */
  public async removeServiceAccount(sa_access_key: string) {
    assert.ok(sa_access_key, 'empty sa_access_key got')
    const sub_cmd = `admin user svcacct remove ${MinioAgent.MC_TARGET} ${sa_access_key}`
    return await this.mc_exec(sub_cmd)
  }

  /**
   * Create bucket
   * @param name 
   * @param options 
   * @returns 
   */
  public async createBucket(name: string, options: { acl?: BUCKET_ACL, with_lock?: boolean, quota?: number }) {
    assert.ok(name, 'empty bubcket name got')

    const acl = options.acl || BUCKET_ACL.private
    const s3 = this.getClient()
    const cmd = new CreateBucketCommand({
      Bucket: name,
      ACL: acl,
      CreateBucketConfiguration: {
        LocationConstraint: Config.MINIO_CONFIG.region
      },
      ObjectLockEnabledForBucket: options?.with_lock ?? false
    })
    const res = await s3.send(cmd)
    if (res?.$metadata?.httpStatusCode === 200) {
      await this.setBucketACL(name, acl)
      const quota = options?.quota || 1 * GB
      await this.setBucketQuota(name, quota)
    }

    const version_cmd = new PutBucketVersioningCommand({
      Bucket: name,
      VersioningConfiguration: {
        Status: 'Enabled'
      }
    })

    const version_res = await s3.send(version_cmd)
    if (version_res?.$metadata?.httpStatusCode === 200) {
      logger.info(`bucket ${name} versioning enabled`)
    }

    return res
  }

  /**
   * Update bucket
   * @param name bucket name
   * @param mode bucket mode
   * @returns 
   */
  public async setBucketACL(name: string, mode: BUCKET_ACL) {
    assert.ok(name, 'empty bubcket name got')

    const s3 = this.getClient()
    if (mode === BUCKET_ACL.private) {
      const cmd = new DeleteBucketPolicyCommand({ Bucket: name })
      return await s3.send(cmd)
    }

    let policy = ''
    if (mode === BUCKET_ACL.readonly) policy = await this.getReadonlyPolicy(name)
    if (mode === BUCKET_ACL.public) policy = await this.getPublicPolicy(name)

    const cmd = new PutBucketPolicyCommand({ Bucket: name, Policy: policy })
    return await s3.send(cmd)
  }

  /**
   * Get bucket stats
   * @param name 
   */
  public async statsBucket(name: string) {
    assert.ok(name, 'empty bubcket name got')
    type GetBucketUsedSizeOutput = {
      prefix: string,
      size: number,
      objects: number,
      isVersions: boolean
    } & MinioCommandExecOuput
    const sub_cmd = `du ${MinioAgent.MC_TARGET}/${name}`

    const res = await this.mc_exec(sub_cmd)
    return res as GetBucketUsedSizeOutput
  }

  /**
   * Set bucket quota
   * @param name the bucket name
   * @param quota bucket quota size in bytes
   */
  public async setBucketQuota(name: string, quota: number) {
    assert.ok(name, 'empty bubcket name got')

    const sub_cmd = `admin bucket quota ${MinioAgent.MC_TARGET}/${name} --hard ${quota}`
    return await this.mc_exec(sub_cmd)
  }

  /**
   * Get bucket quota
   * @param name 
   * @returns 
   */
  public async getBucketQuota(name: string) {
    assert.ok(name, 'empty bubcket name got')

    const sub_cmd = `admin bucket quota ${MinioAgent.MC_TARGET}/${name}`
    return await this.mc_exec(sub_cmd)
  }

  /**
   * Clear bucket quota
   * @param name 
   * @returns 
   */
  public async clearBucketQuota(name: string) {
    assert.ok(name, 'empty bubcket name got')

    const sub_cmd = `admin bucket quota ${MinioAgent.MC_TARGET}/${name} --clear`
    return await this.mc_exec(sub_cmd)
  }

  /**
   * Delete bucket
   * @param name bucket name
   * @returns 
   */
  public async deleteBucket(name: string) {
    assert.ok(name, 'empty bubcket name got')

    const s3 = this.getClient()
    const cmd = new DeleteBucketCommand({ Bucket: name })
    return await s3.send(cmd)
  }

  /**
   * Create an user policy
   * @param policy_name 
   * @param policy_json_path 
   * @returns 
   */
  public async createUserPolicy(policy_name: string, policy_json_path: string) {
    assert.ok(policy_name, 'empty policy_name got')
    assert.ok(policy_json_path, 'empty policy_json_path got')

    const sub_cmd = `admin policy add ${MinioAgent.MC_TARGET} ${policy_name} ${policy_json_path}`
    return await this.mc_exec(sub_cmd)
  }


  /**
   * Execute minio client shell
   * @param sub_cmd 
   * @returns 
   */
  private async mc_exec(sub_cmd: string) {
    const mc_path = process.env.MINIO_CLIENT_PATH || 'mc'
    const cmd = `${mc_path} ${sub_cmd} --json`

    try {
      const { stdout } = await exec(cmd)
      const json: MinioCommandExecOuput = JSON.parse(stdout)
      return json
    } catch (error) {
      logger.error(`failed to exec command: {${cmd}}`, error)
      return {
        status: 'error',
        error: error
      } as MinioCommandExecOuput
    }
  }

  /**
   * Set minio target
   * @returns 
   */
  async mc_set_alias() {
    const access_key = Config.MINIO_CONFIG.access_key
    const access_secret = Config.MINIO_CONFIG.access_secret
    const cmd = `alias set ${MinioAgent.MC_TARGET} ${this.endpoint} ${access_key} ${access_secret}`

    return await this.mc_exec(cmd)
  }


  /**
   * Get readonly policy for a bucket
   * @param bucket 
   * @returns 
   */
  async getReadonlyPolicy(bucket: string) {
    const policy = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "AWS": [
              "*"
            ]
          },
          "Action": [
            "s3:GetObject"
          ],
          "Resource": [
            `arn:aws:s3:::${bucket}/*`
          ]
        }
      ]
    }

    return JSON.stringify(policy)
  }

  /**
   * Get public policy for a bucket
   * @param bucket 
   * @returns 
   */
  async getPublicPolicy(bucket: string) {
    const policy = {
      "Statement": [
        {
          "Action": [
            "s3:GetBucketLocation",
            "s3:ListBucket",
            "s3:ListBucketMultipartUploads"
          ],
          "Effect": "Allow",
          "Principal": {
            "AWS": [
              "*"
            ]
          },
          "Resource": [
            `arn:aws:s3:::${bucket}`
          ]
        },
        {
          "Action": [
            "s3:AbortMultipartUpload",
            "s3:DeleteObject",
            "s3:GetObject",
            "s3:ListMultipartUploadParts",
            "s3:PutObject"
          ],
          "Effect": "Allow",
          "Principal": {
            "AWS": [
              "*"
            ]
          },
          "Resource": [
            `arn:aws:s3:::${bucket}/*`
          ]
        }
      ],
      "Version": "2012-10-17"
    }

    return JSON.stringify(policy)
  }

  async getSTSPolicy() {
    const policy = { "Version": "2012-10-17", "Statement": [{ "Sid": `app-sts-full-grant`, "Effect": "Allow", "Action": "s3:*", "Resource": "arn:aws:s3:::*" }] }
    return JSON.stringify(policy)
  }
}