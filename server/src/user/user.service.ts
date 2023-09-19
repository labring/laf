import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { User, UserWithProfile } from './entities/user'
import { ObjectId } from 'mongodb'
import * as sharp from 'sharp'
import { UserAvatar } from './entities/user-avatar'
import { UserProfile } from './entities/user-profile'

@Injectable()
export class UserService {
  private readonly db = SystemDatabase.db

  async create(data: Partial<User>) {
    const res = await this.db.collection<User>('User').insertOne({
      username: data.username,
      email: data.email,
      phone: data.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return await this.findOneById(res.insertedId)
  }

  async findOneById(id: ObjectId) {
    return this.db
      .collection<User>('User')
      .aggregate<UserWithProfile>()
      .match({ _id: id })
      .lookup({
        from: 'UserProfile',
        localField: '_id',
        foreignField: 'uid',
        as: 'profile',
      })
      .unwind({ path: '$profile', preserveNullAndEmptyArrays: true })
      .next()
  }

  async findOneByUsername(username: string) {
    return this.db.collection<User>('User').findOne({ username })
  }

  // find user by phone
  async findOneByPhone(phone: string) {
    const user = await this.db.collection<User>('User').findOne({
      phone,
    })

    return user
  }

  // find user by email
  async findOneByEmail(email: string) {
    const user = await this.db.collection<User>('User').findOne({
      email,
    })

    return user
  }

  // find user by github id
  async findOneByGithub(gid: number) {
    const user = await this.db.collection<User>('User').findOne({
      github: gid,
    })

    return user
  }

  // find user by username | phone | email
  async findOneByUsernameOrPhoneOrEmail(key: string) {
    // match either username or phone or email
    const user = await this.db.collection<User>('User').findOne({
      $or: [{ username: key }, { phone: key }, { email: key }],
    })

    return user
  }

  async updateUser(id: ObjectId, data: Partial<User>) {
    await this.db
      .collection<User>('User')
      .updateOne({ _id: id }, { $set: data })

    return await this.findOneById(id)
  }

  async updateAvatarUrl(url: string, userid: ObjectId) {
    await this.db.collection<UserProfile>('UserProfile').updateOne(
      { uid: userid },
      {
        $set: {
          avatar: url,
        },
      },
    )

    return await this.findOneById(userid)
  }

  async updateAvatar(image: Express.Multer.File, userid: ObjectId) {
    const buffer = await sharp(image.buffer).resize(100, 100).webp().toBuffer()

    const client = SystemDatabase.client
    const session = client.startSession()
    session.startTransaction()

    try {
      await this.db
        .collection<UserAvatar>('UserAvatar')
        .deleteOne({ createdBy: userid }, { session })

      await this.db.collection<UserAvatar>('UserAvatar').insertOne(
        {
          data: buffer,
          createdBy: new ObjectId(userid),
          createdAt: new Date(),
        },
        { session },
      )

      await this.db.collection<UserProfile>('UserProfile').updateOne(
        { uid: userid },
        {
          $set: {
            avatar: '',
          },
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

    return await this.findOneById(userid)
  }

  async getAvatarData(uid: ObjectId) {
    const user = await this.findOneById(uid)
    if (!user) {
      return null
    }

    const avatar = await this.db
      .collection<UserAvatar>('UserAvatar')
      .findOne({ createdBy: user._id })

    if (!avatar?.data) {
      return null
    }

    return avatar.data.buffer
  }
}
