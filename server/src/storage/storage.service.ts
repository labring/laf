import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts'
import { Injectable } from '@nestjs/common'
import { ServerConfig } from 'src/constants'
import { OSSUser } from 'src/core/api/oss-user.cr'

@Injectable()
export class StorageService {
  /**
   * Create s3 client of application
   * @param app
   * @returns
   */
  private getSTSClient(oss: OSSUser) {
    return new STSClient({
      endpoint: ServerConfig.OSS_ENDPOINT,
      credentials: {
        accessKeyId: oss.status?.accessKey,
        secretAccessKey: oss.status?.secretKey,
      },
      region: oss.status?.region,
    })
  }

  /**
   * Generate application full-granted OSS STS
   * @param bucket
   * @param duration_seconds
   * @returns
   */
  public async getOssSTS(
    appid: string,
    user: OSSUser,
    duration_seconds?: number,
  ) {
    const exp = duration_seconds || 3600 * 24 * 7
    const s3 = this.getSTSClient(user)
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
