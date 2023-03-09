import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class BundleService {
  private readonly logger = new Logger(BundleService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.bundle.findUnique({
      where: { id },
    })
  }

  async findOneByName(name: string, regionName: string) {
    return this.prisma.bundle.findFirst({
      where: {
        name: name,
        region: {
          name: regionName,
        },
      },
    })
  }

  async findApplicationBundle(appid: string) {
    return this.prisma.applicationBundle.findUnique({
      where: { appid },
    })
  }

  async deleteApplicationBundle(appid: string) {
    return this.prisma.applicationBundle.delete({
      where: { appid },
    })
  }
}
