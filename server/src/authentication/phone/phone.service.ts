import { Injectable, Logger } from '@nestjs/common'
import { AuthenticationService } from '../authentication.service'
import { PhoneSigninDto } from '../dto/phone-signin.dto'
import { hashPassword } from 'src/utils/crypto'
import { SmsVerifyCodeType } from '../entities/sms-verify-code'
import { User } from 'src/user/entities/user'
import {
  InviteRelation,
  InviteCode,
  InviteCodeState,
} from '../entities/invite-code'
import { SystemDatabase } from 'src/system-database'
import { UserService } from 'src/user/user.service'
import {
  UserPassword,
  UserPasswordState,
} from 'src/user/entities/user-password'
import { UserProfile } from 'src/user/entities/user-profile'
import { SmsService } from './sms.service'
import { AccountService } from 'src/account/account.service'
import {
  AccountChargeOrder,
  AccountChargePhase,
  Currency,
  PaymentChannelType,
} from 'src/account/entities/account-charge-order'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { ObjectId } from 'mongodb'
import { Setting, SettingKey } from 'src/setting/entities/setting'

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly smsService: SmsService,
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Send phone verify code
   * @param phone phone number
   * @param type sms type Signin | Signup | ResetPassword
   * @param ip client ip
   * @returns
   */
  async sendCode(phone: string, type: SmsVerifyCodeType, ip: string) {
    // check if phone number satisfy the send condition
    let err = await this.smsService.checkSendable(phone, ip)
    if (err) {
      return err
    }

    // Send sms code
    const code = Math.floor(Math.random() * 900000 + 100000).toString()
    err = await this.smsService.sendPhoneCode(phone, code)
    if (err) {
      return err
    }

    // disable previous sms code
    await this.smsService.disableSameTypeCode(phone, type)

    // Save new sms code to database
    await this.smsService.saveCode(phone, code, type, ip)

    return null
  }

  /**
   * Signup a user by phone
   * @param dto
   * @returns
   */
  async signup(dto: PhoneSigninDto, withUsername = false) {
    const { phone, username, password, inviteCode } = dto

    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      session.startTransaction()
      const randomUsername = new ObjectId()
      // create user
      const user = await this.db.collection<User>('User').insertOne(
        {
          phone,
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
