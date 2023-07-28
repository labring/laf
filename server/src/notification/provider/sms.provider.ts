import { NotificationProvider } from './interface'
import Dysmsapi, * as dysmsapi from '@alicloud/dysmsapi20170525'
import * as OpenApi from '@alicloud/openapi-client'
import * as Util from '@alicloud/tea-util'
import { User } from 'src/user/entities/user'

export class SmsNotificationProvider implements NotificationProvider {
  static providerName = 'sms'

  async sendNotification(
    content: string,
    config: any,
    user: User,
    payload?: any,
  ) {
    const { accessKeyId, accessKeySecret, signName, endpoint } = config
    const templateCode = content

    const sendSmsRequest = new dysmsapi.SendSmsRequest({
      phoneNumbers: user.phone,
      signName,
      templateCode,
      templateParam: JSON.stringify(payload || {}),
    })

    const _config = new OpenApi.Config({
      accessKeyId,
      accessKeySecret,
      endpoint,
    })

    const client = new Dysmsapi(_config)
    const runtime = new Util.RuntimeOptions({})
    return await client.sendSmsWithOptions(sendSmsRequest, runtime)
  }
}
