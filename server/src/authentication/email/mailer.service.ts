import { Injectable, Logger } from '@nestjs/common'
import { AuthenticationService } from '../authentication.service'
import { createTransport } from 'nodemailer'
import { template } from 'lodash'

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)

  constructor(private readonly authService: AuthenticationService) {}

  async sendEmailCode(email: string, code: string) {
    try {
      const res = await this.sendEmailCodeBySmtp(email, code.toString())
      if (res.rejected.length > 0) {
        return `email for verify code was rejected: ${res.rejected.join(',')}`
      }
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return error.message
    }
  }

  async sendEmailCodeBySmtp(email: string, code: string) {
    const config = await this.loadEmailConfig()

    const transporter = createTransport(config.transport)

    const _template = template(config.template)

    const res = await transporter.sendMail({
      from: config.from,
      to: email,
      subject: config.subject,
      html: _template({ code }),
    })

    return res
  }

  private async loadEmailConfig() {
    const mailProvider = await this.authService.getEmailProvider()
    return mailProvider.config
  }
}
