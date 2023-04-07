import { Injectable, Logger } from '@nestjs/common'
import { Bundle } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class BundleService {
  private readonly logger = new Logger(BundleService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string, regionId: string) {
    return this.prisma.bundle.findFirst({
      where: { id, regionId },
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

  getSubscriptionOption(bundle: Bundle, duration: number) {
    const options = bundle.subscriptionOptions
    const found = options.find((option) => option.duration === duration)
    return found ? found : null
  }
}
