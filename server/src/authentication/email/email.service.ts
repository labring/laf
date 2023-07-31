import { SystemDatabase } from 'src/system-database'
import {
  EmailVerifyCode,
  EmailVerifyCodeState,
  EmailVerifyCodeType,
} from '../entities/email-verify-code'
import { MailerService } from './mailer.service'
import {
  CODE_VALIDITY,
  LIMIT_CODE_PER_IP_PER_DAY,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_MINUTE,
} from 'src/constants'
import { isEmail } from 'class-validator'
import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}
  private readonly db = SystemDatabase.db

  async sendCode(email: string, type: EmailVerifyCodeType, ip: string) {
    let err = await this.checkSendable(email, ip)
    if (err) return err

    const code = Math.floor(Math.random() * 900000 + 100000).toString()
    err = await this.mailerService.sendEmailCode(email, code)
    if (err) return err

    await this.disableSameTypeCode(email, type)

    await this.saveCode(email, code, type, ip)
  }

  async saveCode(
    email: string,
    code: string,
    type: EmailVerifyCodeType,
    ip: string,
  ) {
    await this.db.collection<EmailVerifyCode>('EmailVerifyCode').insertOne({
      email,
      code,
      type,
      ip,
      createdAt: new Date(),
      updatedAt: new Date(),
      state: EmailVerifyCodeState.Unused,
    })
  }

  // Valid given email and code with code type
  async validateCode(email: string, code: string, type: EmailVerifyCodeType) {
    const total = await this.db
      .collection<EmailVerifyCode>('EmailVerifyCode')
      .countDocuments({
        email,
        code,
        type,
        state: EmailVerifyCodeState.Unused,
        createdAt: { $gt: new Date(Date.now() - CODE_VALIDITY) },
      })

    if (total === 0) return 'invalid code'

    // Disable verify code after valid
    await this.disableCode(email, code, type)
    return null
  }

  // Disable verify code
  async disableCode(email: string, code: string, type: EmailVerifyCodeType) {
    await this.db
      .collection<EmailVerifyCode>('EmailVerifyCode')
      .updateMany(
        { email, code, type, state: EmailVerifyCodeState.Unused },
        { $set: { state: EmailVerifyCodeState.Used } },
      )
  }

  // Disable same type verify code
  async disableSameTypeCode(email: string, type: EmailVerifyCodeType) {
    await this.db
      .collection<EmailVerifyCode>('EmailVerifyCode')
      .updateMany(
        { email, type, state: EmailVerifyCodeState.Unused },
        { $set: { state: EmailVerifyCodeState.Used } },
      )
  }

  // check if email satisfy the send condition
  async checkSendable(email: string, ip: string) {
    // Check if email is valid
    if (!isEmail(email)) {
      return 'INVALID_EMAIL'
    }

    // Check if email has been the sent verify code in 1 minute
    const count = await this.db
      .collection<EmailVerifyCode>('EmailVerifyCode')
      .countDocuments({
        email,
        createdAt: { $gt: new Date(Date.now() - MILLISECONDS_PER_MINUTE) },
      })

    if (count > 0) {
      return 'REQUEST_OVERLIMIT: email has been sent the verify code in 1 minute'
    }

    // Check if ip has been send email code beyond 30 times in 24 hours
    const countIps = await this.db
      .collection<EmailVerifyCode>('EmailVerifyCode')
      .countDocuments({
        ip: ip,
        createdAt: { $gt: new Date(Date.now() - MILLISECONDS_PER_DAY) },
      })

    if (countIps > LIMIT_CODE_PER_IP_PER_DAY) {
      return `REQUEST_OVERLIMIT: ip has been send email code beyond ${LIMIT_CODE_PER_IP_PER_DAY} times in 24 hours`
    }

    return null
  }
}
