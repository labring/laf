import { Injectable, Logger } from '@nestjs/common'
import * as nanoid from 'nanoid'
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ApplicationPhase, ApplicationState, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { DatabaseCoreService } from 'src/core/database.cr.service'
import { GatewayCoreService } from 'src/core/gateway.cr.service'
import { OSSUserCoreService } from 'src/core/oss-user.cr.service'
import { APPLICATION_SECRET_KEY, ServerConfig } from 'src/constants'
import { GenerateAlphaNumericPassword } from 'src/common/random'
import { OSSUser } from 'src/core/api/oss-user.cr'
import * as assert from 'node:assert'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseCore: DatabaseCoreService,
    private readonly gatewayCore: GatewayCoreService,
    private readonly ossCore: OSSUserCoreService,
    private readonly jwtService: JwtService,
  ) {}

  async create(userid: string, dto: CreateApplicationDto) {
    try {
      // create app in db
      const appSecret = {
        name: APPLICATION_SECRET_KEY,
        value: GenerateAlphaNumericPassword(64),
      }
      const appid = this.generateAppID(ServerConfig.APPID_LENGTH)

      const data: Prisma.ApplicationCreateInput = {
        name: dto.name,
        appid,
        state: ApplicationState.Running,
        phase: ApplicationPhase.Creating,
        tags: [],
        createdBy: userid,
        region: {
          connect: {
            name: dto.region,
          },
        },
        bundle: {
          connect: {
            name: dto.bundleName,
          },
        },
        runtime: {
          connect: {
            name: dto.runtimeName,
          },
        },
        configuration: {
          create: {
            environments: [appSecret],
          },
        },
      }

      const application = await this.prisma.application.create({ data })
      if (!application) {
        throw new Error('create application failed')
      }

      return application
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }

  async findAllByUser(userid: string) {
    return this.prisma.application.findMany({
      where: {
        createdBy: userid,
        phase: {
          not: ApplicationPhase.Deleted,
        },
      },
    })
  }

  async findOne(appid: string, include?: Prisma.ApplicationInclude) {
    const application = await this.prisma.application.findUnique({
      where: { appid },
      include: {
        region: include?.region,
        bundle: include?.bundle,
        runtime: include?.runtime,
        configuration: include?.configuration,
      },
    })

    return application
  }

  async getSubResources(appid: string) {
    const database = await this.databaseCore.findOne(appid)
    const oss = await this.ossCore.findOne(appid)
    const gateway = await this.gatewayCore.findOne(appid)

    return { database, oss, gateway }
  }

  async update(appid: string, dto: UpdateApplicationDto) {
    try {
      // update app in db
      const data: Prisma.ApplicationUpdateInput = {
        updatedAt: new Date(),
      }
      if (dto.name) {
        data.name = dto.name
      }
      if (dto.state) {
        data.state = dto.state
      }

      const application = await this.prisma.application.update({
        where: { appid },
        data,
      })

      return application
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }

  async remove(appid: string) {
    try {
      const res = await this.prisma.application.update({
        where: { appid },
        data: {
          phase: ApplicationPhase.Deleting,
        },
      })

      return res
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }

  generateAppID(len: number) {
    len = len || 6
    const only_alpha = 'abcdefghijklmnopqrstuvwxyz'
    const alphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const prefix = nanoid.customAlphabet(only_alpha, 1)()
    const nano = nanoid.customAlphabet(alphanumeric, len - 1)
    return prefix + nano()
  }

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

  async getDebugFunctionToken(appid: string) {
    const conf = await this.prisma.applicationConfiguration.findUnique({
      where: { appid },
    })

    // get secret from envs
    const secret = conf?.environments.find(
      (env) => env.name === APPLICATION_SECRET_KEY,
    )
    assert(secret?.value, 'application secret not found')

    // generate token
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days

    const token = this.jwtService.sign(
      { appid, type: 'debug', exp },
      { secret: secret.value },
    )
    return token
  }
}
