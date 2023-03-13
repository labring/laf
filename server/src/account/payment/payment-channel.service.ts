import { Injectable, Logger } from '@nestjs/common'
import { PaymentChannelType } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { WeChatPaymentChannelSpec } from './types'

@Injectable()
export class PaymentChannelService {
  private readonly logger = new Logger(PaymentChannelService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all payment channels
   * @returns
   */
  async findAll() {
    const res = await this.prisma.paymentChannel.findMany({
      where: {
        state: 'Inactive',
      },
      select: {
        id: true,
        type: true,
        name: true,
        state: true,
        /**
         * Security Warning: DO NOT response sensitive information to client.
         * KEEP IT false!
         */
        spec: false,
      },
    })
    return res
  }

  async getWeChatPaySpec(): Promise<WeChatPaymentChannelSpec> {
    const res = await this.prisma.paymentChannel.findFirst({
      where: {
        type: PaymentChannelType.WeChat,
      },
    })

    if (!res) {
      throw new Error('No WeChat Pay channel found')
    }

    return res.spec as any
  }
}
