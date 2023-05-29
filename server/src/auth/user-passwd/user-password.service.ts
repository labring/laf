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

@Injectable()
export class UserPasswordService {
  private readonly logger = new Logger(UserPasswordService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly authService: AuthenticationService,
    private readonly userService: UserService,
  ) {}

  // Singup by username and password
  async signup(
    username: string,
    password: string,
    phone: string,
    inviteCode: string,
  ) {
    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      session.startTransaction()
      // create user
      const res = await this.db.collection<User>('User').insertOne(
        {
          username,
          phone,
          email: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

      // create password
      await this.db.collection<UserPassword>('UserPassword').insertOne(
        {
          uid: res.insertedId,
          password: hashPassword(password),
          state: UserPasswordState.Active,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

      // create invite relation
      if (inviteCode && inviteCode.length === 7) {
        const result = await this.db
          .collection<InviteCode>('InviteCode')
          .findOne({
            code: inviteCode,
            state: InviteCodeState.Enabled,
          })
        if (result) {
          await this.db.collection<InviteRelation>('InviteRelation').insertOne(
            {
              uid: res.insertedId,
              invitedBy: result.uid,
              codeId: result._id,
              createdAt: new Date(),
            },
            { session },
          )
        }
      }

      // create profile
      await this.db.collection<UserProfile>('UserProfile').insertOne(
        {
          uid: res.insertedId,
          name: username,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { session },
      )

      await session.commitTransaction()
      return this.userService.findOneById(res.insertedId)
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
