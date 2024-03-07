import { Injectable, Logger } from '@nestjs/common'
import { hashPassword } from 'src/utils/crypto'
import { AuthenticationService } from '../authentication.service'
import { SystemDatabase } from 'src/system-database'
import { User } from 'src/user/entities/user'
import {
  UserPassword,
  UserPasswordState,
} from 'src/user/entities/user-password'
import {
  InviteCode,
  InviteRelation,
  InviteCodeState,
} from '../entities/invite-code'
import { UserProfile } from 'src/user/entities/user-profile'
import { UserService } from 'src/user/user.service'
import { ObjectId } from 'mongodb'
import { AccountService } from 'src/account/account.service'
import {
  AccountChargeOrder,
  AccountChargePhase,
  Currency,
  PaymentChannelType,
} from 'src/account/entities/account-charge-order'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { Setting, SettingKey } from 'src/setting/entities/setting'

@Injectable()
export class UserPasswordService {
  private readonly logger = new Logger(UserPasswordService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  // Signup by username and password
  async signup(
    username: string,
    password: string,
    phone: string,
    email: string,
    inviteCode: string,
  ) {
    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      session.startTransaction()
      // create user
      const user = await this.db.collection<User>('User').insertOne(
        {
          username,
          phone,
          email,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

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

      await session.commitTransaction()
      return await this.userService.findOneById(user.insertedId)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  // Signin for user, means get access token
  signin(user: User) {
    return this.authService.getAccessTokenByUser(user)
  }

  // validate if password is correct
  async validatePassword(uid: ObjectId, password: string) {
    const userPasswd = await this.db
      .collection<UserPassword>('UserPassword')
      .findOne({ uid, state: UserPasswordState.Active })

    if (!userPasswd) {
      return 'password not exists'
    }

    if (userPasswd.password !== hashPassword(password)) {
      return 'password incorrect'
    }

    return null
  }

  // reset password
  async resetPassword(uid: ObjectId, password: string) {
    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      session.startTransaction()
      // disable old password
      await this.db
        .collection<UserPassword>('UserPassword')
        .updateMany(
          { uid },
          { $set: { state: UserPasswordState.Inactive } },
          { session },
        )

      // create new password
      await this.db.collection<UserPassword>('UserPassword').insertOne(
        {
          uid,
          password: hashPassword(password),
          state: UserPasswordState.Active,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  // check if set password
  async hasPassword(uid: ObjectId) {
    const res = await this.db
      .collection<UserPassword>('UserPassword')
      .findOne({ uid, state: UserPasswordState.Active })

    return res ? true : false
  }
}
