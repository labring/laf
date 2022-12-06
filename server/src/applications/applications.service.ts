import { Injectable, Logger } from '@nestjs/common'
import { CreateApplicationDto } from './dto/create-application.dto'
import {
  Application,
  ApplicationPhase,
  ApplicationState,
  Bundle,
  Prisma,
  Region,
  Runtime,
} from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { DatabaseCoreService } from 'src/core/database.cr.service'
import { GatewayCoreService } from 'src/core/gateway.cr.service'
import { OSSUserCoreService } from 'src/core/oss-user.cr.service'
import { APPLICATION_SECRET_KEY } from 'src/constants'
import { GenerateAlphaNumericPassword } from 'src/common/random'
import { Database } from 'src/core/api/database.cr'
import { Gateway } from 'src/core/api/gateway.cr'
import { OSSUser } from 'src/core/api/oss-user.cr'
import { isConditionTrue } from 'src/common/getter'

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseCore: DatabaseCoreService,
    private readonly gatewayCore: GatewayCoreService,
    private readonly ossCore: OSSUserCoreService,
  ) {}

  async create(userid: string, appid: string, dto: CreateApplicationDto) {
    try {
      // create app in db
      const appSecret = {
        name: APPLICATION_SECRET_KEY,
        value: GenerateAlphaNumericPassword(64),
      }

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

      // create app resources
      await this.createSubResources(application)
      return application
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }

  /**
   * Create app resource in k8s: database, gateway, oss
   * @param app
   * @returns
   */
  async createSubResources(app: Application) {
    // get app bundle
    const bundle = await this.prisma.bundle.findUnique({
      where: { name: app.bundleName },
    })
    if (!bundle) {
      throw new Error('bundle not found')
    }

    // create database resource
    const database = await this.databaseCore.create(app, bundle)
    if (!database) {
      throw new Error('create database failed')
    }

    // create oss resource
    const oss = await this.ossCore.create(app, bundle)
    if (!oss) {
      throw new Error('create oss failed')
    }

    // create gateway resource
    const gateway = await this.gatewayCore.create(app.appid)
    if (!gateway) {
      throw new Error('create gateway failed')
    }

    return { database, oss, gateway }
  }

  async getSubResources(appid: string) {
    const database = await this.databaseCore.findOne(appid)
    const oss = await this.ossCore.findOne(appid)
    const gateway = await this.gatewayCore.findOne(appid)

    return { database, oss, gateway }
  }

  async findAllByUser(userid: string) {
    return this.prisma.application.findMany({
      where: {
        createdBy: userid,
      },
    })
  }

  async findOne(appid: string) {
    const application = await this.prisma.application.findUnique({
      where: { appid },
      include: {
        region: true,
        bundle: true,
        runtime: true,
      },
    })

    return application
  }

  async updatePhaseIfSubResourceCreated(
    app: Application,
    database: Database,
    gateway: Gateway,
    oss: OSSUser,
  ) {
    if (app.phase !== ApplicationPhase.Creating) return
    if (!isConditionTrue('Ready', database.status?.conditions)) return
    if (!isConditionTrue('Ready', gateway.status?.conditions)) return
    if (!isConditionTrue('Ready', oss.status?.conditions)) return

    return await this.prisma.application.update({
      where: { appid: app.appid },
      data: {
        phase: ApplicationPhase.Created,
      },
    })
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
      // remove app in db
      const application = await this.prisma.application.delete({
        where: { appid },
      })

      return application
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }
}
