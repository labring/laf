import { Injectable, Logger } from '@nestjs/common'
import { WeChatPaySpec } from './types'
import { SystemDatabase } from 'src/system-database'
import { PaymentChannel } from '../entities/payment-channel'
import { BaseState } from '../entities/account'
import { PaymentChannelType } from '../entities/account-charge-order'

@Injectable()
export class PaymentChannelService {
  private readonly logger = new Logger(PaymentChannelService.name)
  private readonly db = SystemDatabase.db

  /**
   * Get all payment channels
   * @returns
   */
  async findAll() {
    const res = await this.db
      .collection<PaymentChannel>('PaymentChannel')
      .find(
        { state: BaseState.Active },
        {
          projection: {
            // Security Warning: DO NOT response sensitive information to client.
            // KEEP IT false!
            spec: false,
          },
        },
      )
      .toArray()

    return res
  }

  async getWeChatPaySpec() {
    const res = await this.db
      .collection<PaymentChannel<WeChatPaySpec>>('PaymentChannel')
      .findOne({ type: PaymentChannelType.WeChat })

    if (!res) {
      throw new Error('No WeChat Pay channel found')
    }

    return res.spec
  }
}
