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
import { InvitationProfitAmount } from 'src/account/entities/invitation-profit-amount'
import { Account } from 'src/account/entities/account'
import { AccountTransaction } from 'src/account/entities/account-transaction'

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

      // create user
      const user = await this.db.collection<User>('User').insertOne(
        {
          phone,
          username: username || phone,
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
          let amount: number
          const inviteProfit = await this.db
            .collection<InvitationProfitAmount>('Setting')
            .findOne({
              settingName: 'invitation Profit Amount',
            })
          if (inviteProfit) {
            amount = inviteProfit.amount
          } else {
            amount = 0
          }

          // update account balance
          const accountAfterUpdate = await this.db
            .collection<Account>('Account')
            .findOneAndUpdate(
              { _id: account._id },
              {
                $inc: { balance: amount },
                $set: { updatedAt: new Date() },
              },
              { session, returnDocument: 'after' },
            )

          // add transaction record
          const transaction = await this.db
            .collection<AccountTransaction>('AccountTransaction')
            .insertOne(
              {
                accountId: account._id,
                amount: amount,
                balance: accountAfterUpdate.value.balance,
                message: 'invitation Profit',
                createdAt: new Date(),
              },
              { session },
            )

          await this.db.collection<InviteRelation>('InviteRelation').insertOne(
            {
              uid: user.insertedId,
              invitedBy: inviteCodeInfo.uid,
              codeId: inviteCodeInfo._id,
              createdAt: new Date(),
              transactionId: transaction.insertedId,
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
