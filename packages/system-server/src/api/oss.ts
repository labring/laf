import assert = require("assert")
import * as cp from 'child_process'
import { promisify } from 'util'
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts'
import { CreateBucketCommand, DeleteBucketPolicyCommand, PutBucketPolicyCommand, S3 } from '@aws-sdk/client-s3'
import { logger } from "../lib/logger"
import Config from "../config"
import { ApplicationStruct } from "./application"
const exec = promisify(cp.exec)

export enum BUCKET_ACL {
  private = 'private',
  readonly = 'public-read',
  public = 'public-read-write'
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

  constructor() {
    throw new Error('constructor() is unsupported, use `await MinioAgent.New()` instead')
  }

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
      region: 'us-east-1'
    })
  }

  /**
   * Create s3 client of application
   * @param app 
   * @returns 
   */
  public getApplicationSTSClient(app: ApplicationStruct) {
    return new STSClient({
      endpoint: Config.MINIO_CONFIG.endpoint.external,
      credentials: {
        accessKeyId: app.appid,
        secretAccessKey: app.config.server_secret_salt,
      },
      region: 'us-east-1'
    })
  }

  /**
   * Generate application full-granted STS 
   * @param app 
   * @param duration_seconds 
   * @returns 
   */
  public async getApplicationSTS(app: ApplicationStruct, duration_seconds: number) {
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
   * Create bucket
   * @param name bucket name
   * @param acl bucket mode
   * @returns bucket id or undefined
   */
  public async createBucket(name: string, acl: BUCKET_ACL) {
    assert.ok(name, 'empty name got')
    assert.ok(acl !== undefined, 'undefined mode got')

    const s3 = this.getClient()
    const cmd = new CreateBucketCommand({ Bucket: name, ACL: acl })
    const res = await s3.send(cmd)

    return res
  }

  /**
   * Update bucket
   * @param name bucket name
   * @param mode bucket mode
   * @returns 
   */
  public async setBucketACL(name: string, mode: BUCKET_ACL) {
    assert.ok(name, 'empty name got')

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
   * Delete bucket
   * @param name bucket name
   * @returns 
   */
  public async deleteBucket(name: string) {
    assert.ok(name, 'empty name got')

    const s3 = this.getClient()
    const cmd = new DeleteBucketPolicyCommand({ Bucket: name })
    return await s3.send(cmd)
  }


  /**
   * Execute minio client shell
   * @param sub_cmd 
   * @returns 
   */
  private async mc_exec(sub_cmd: string) {
    const mc_path = process.env.MINIO_CLIENT_PATH || 'mc'
    const cmd = `${mc_path} ${sub_cmd} --json --anonymous`

    try {
      const { stdout } = await exec(cmd)
      const json = JSON.parse(stdout)
      return json?.status === 'success'
    } catch (error) {
      logger.error(`failed to exec command: {${cmd}}`, error)
      return false
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