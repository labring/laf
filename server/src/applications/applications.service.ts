import { Injectable, Logger } from '@nestjs/common'
import { CreateApplicationDto } from './dto/create-application.dto'
import { Application, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { ApplicationCoreService } from 'src/core/application.cr.service'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { stringify } from 'querystring'

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name)
  constructor(
    private readonly prisma: PrismaService,
    private readonly applicationCore: ApplicationCoreService,
  ) {}

  async create(userid: string, appid: string, dto: CreateApplicationDto) {
    try {
      const res = await this.prisma.$transaction(async (tx) => {
        // create app custom object in k8s
        const resource = await this.applicationCore.create(userid, appid, dto)
        if (!resource) {
          throw new Error('create application failed')
        }

        // create app in db
        const data: Prisma.ApplicationCreateInput = {
          name: dto.displayName,
          appid,
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
        }

        const application = await tx.application.create({
          data,
        })

        return { application, resource }
      })

      return res
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
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
    })

    return application
  }

  async update(appid: string, dto: UpdateApplicationDto) {
    try {
      // update app in k8s
      const r = await this.applicationCore.update(appid, dto)
      if (!r) {
        throw new Error('update application failed')
      }

      // update app in db
      const data: Prisma.ApplicationUpdateInput = {
        updatedAt: new Date(),
      }
      if (dto.displayName) {
        data.name = dto.displayName
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
      // remove app in k8s
      const r = await this.applicationCore.remove(appid)
      if (!r) {
        throw new Error('remove application failed')
      }

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
