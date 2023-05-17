import { Injectable, Logger } from '@nestjs/common'
import { SmsService } from 'src/auth/phone/sms.service'
import { AuthenticationService } from '../authentication.service'
import { PhoneSigninDto } from '../dto/phone-signin.dto'
import { hashPassword } from 'src/utils/crypto'
import { SmsVerifyCodeType } from '../entities/sms-verify-code'
import { User } from 'src/user/entities/user'
import { SystemDatabase } from 'src/database/system-database'
import { UserService } from 'src/user/user.service'
import {
  UserPassword,
  UserPasswordState,
} from 'src/user/entities/user-password'
import { UserProfile } from 'src/user/entities/user-profile'

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly smsService: SmsService,
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
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
    const { phone, username, password } = dto

    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      session.startTransaction()

      // create user
      const res = await this.db.collection<User>('User').insertOne(
        {
          phone,
          username: username || phone,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

      const user = await this.userService.findOneById(res.insertedId)

      // create profile
      await this.db.collection<UserProfile>('UserProfile').insertOne(
        {
          uid: user._id,
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
            uid: user._id,
            password: hashPassword(password),
            state: UserPasswordState.Active,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )
      }

      await session.commitTransaction()
      return user
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
