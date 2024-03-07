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
  TASK_LOCK_INIT_TIME,
} from 'src/constants'
import { isEmail } from 'class-validator'
import { Injectable } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { User } from 'src/user/entities/user'
import {
  InviteCode,
  InviteCodeState,
  InviteRelation,
} from '../entities/invite-code'
import { Setting, SettingKey } from 'src/setting/entities/setting'
import {
  AccountChargeOrder,
  AccountChargePhase,
  Currency,
  PaymentChannelType,
} from 'src/account/entities/account-charge-order'
import { UserProfile } from 'src/user/entities/user-profile'
import {
  UserPassword,
  UserPasswordState,
} from 'src/user/entities/user-password'
import { hashPassword } from 'src/utils/crypto'
import { EmailSigninDto } from '../dto/email-signin.dto'
import { AuthenticationService } from '../authentication.service'
import { UserService } from 'src/user/user.service'
import { AccountService } from 'src/account/account.service'

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}
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

  /**
   * Signup a user by email
   * @param dto
   * @returns
   */
  async signup(dto: EmailSigninDto, withUsername = false) {
    const { email, username, password, inviteCode } = dto

    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      session.startTransaction()
      const randomUsername = new ObjectId()
      // create user
      const user = await this.db.collection<User>('User').insertOne(
        {
          email,
          username: username || randomUsername.toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

      // create invite relation and add invite profit
      if (inviteCode) {
        const inviteCodeInfo = await this.db
          .collection<InviteCode>('InviteCode')
          .findOne({
            code: inviteCode,
            state: InviteCodeState.Enabled,
          })

        if (inviteCodeInfo) {
          const account = await this.accountService.findOne(inviteCodeInfo.uid)
          // get invitation Profit Amount
          let amount = 0
          const inviteProfit = await this.db
            .collection<Setting>('Setting')
            .findOne({
              key: SettingKey.InvitationProfit,
              public: true,
            })
          if (inviteProfit) {
            amount = parseFloat(inviteProfit.value)
          }
          // add invite-code charge order
          await this.db
            .collection<AccountChargeOrder>('AccountChargeOrder')
            .insertOne(
              {
                accountId: account._id,
                amount: amount,
                currency: Currency.CNY,
                phase: AccountChargePhase.Paid,
                channel: PaymentChannelType.InviteCode,
                createdBy: new ObjectId(inviteCodeInfo.uid),
                lockedAt: TASK_LOCK_INIT_TIME,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              { session },
            )

          const res = await this.accountService.chargeWithTransaction(
            account._id,
            amount,
            'Invitation profit',
            session,
          )

          await this.db.collection<InviteRelation>('InviteRelation').insertOne(
            {
              uid: user.insertedId,
              invitedBy: inviteCodeInfo.uid,
              codeId: inviteCodeInfo._id,
              createdAt: new Date(),
              transactionId: res.transaction.insertedId,
            },
            { session },
          )
        }
      }

      // create profile
      await this.db.collection<UserProfile>('UserProfile').insertOne(
        {
          uid: user.insertedId,
          name: username,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

      if (withUsername) {
        // create password
        await this.db.collection<UserPassword>('UserPassword').insertOne(
          {
            uid: user.insertedId,
            password: hashPassword(password),
            state: UserPasswordState.Active,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )
      }

      await session.commitTransaction()
      return await this.userService.findOneById(user.insertedId)
    } catch (err) {
      await session.abortTransaction()
      throw err
    } finally {
      await session.endSession()
    }
  }

  /**
   * signin a user, return token and if bind password
   * @param user user
   * @returns token and if bind password
   */
  signin(user: User) {
    const token = this.authService.getAccessTokenByUser(user)
    return token
  }

  // check if current user has bind password
  async ifBindPassword(user: User) {
    const count = await this.db
      .collection<UserPassword>('UserPassword')
      .countDocuments({
        uid: user._id,
        state: UserPasswordState.Active,
      })

    return count > 0
  }
}
