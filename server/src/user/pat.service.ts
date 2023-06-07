import { Injectable, Logger } from '@nestjs/common'
import { GenerateAlphaNumericPassword } from 'src/utils/random'
import { CreatePATDto } from './dto/create-pat.dto'
import { SystemDatabase } from 'src/system-database'
import {
  PersonalAccessToken,
  PersonalAccessTokenWithUser,
} from './entities/pat'
import { ObjectId } from 'mongodb'

@Injectable()
export class PatService {
  private readonly logger = new Logger(PatService.name)
  private readonly db = SystemDatabase.db

  async create(userid: ObjectId, dto: CreatePATDto) {
    const { name, expiresIn } = dto
    const token = 'laf_' + GenerateAlphaNumericPassword(60)

    const res = await this.db
      .collection<PersonalAccessToken>('PersonalAccessToken')
      .insertOne({
        uid: userid,
        name,
        token,
        expiredAt: new Date(Date.now() + expiresIn * 1000),
        createdAt: new Date(),
      })

    return this.findOne(res.insertedId)
  }

  async findAll(userid: ObjectId) {
    const pats = await this.db
      .collection<PersonalAccessToken>('PersonalAccessToken')
      .find({ uid: userid }, { projection: { token: 0 } })
      .toArray()

    return pats
  }

  async findOneByToken(token: string) {
    const pat = await this.db
      .collection('PersonalAccessToken')
      .aggregate<PersonalAccessTokenWithUser>()
      .match({ token })
      .lookup({
        from: 'User',
        localField: 'uid',
        foreignField: '_id',
        as: 'user',
      })
      .unwind('$user')
      .next()

    return pat
  }

  async findOne(id: ObjectId) {
    const pat = await this.db
      .collection<PersonalAccessToken>('PersonalAccessToken')
      .findOne({ _id: id })

    return pat
  }

  async count(userid: ObjectId) {
    const count = await this.db
      .collection<PersonalAccessToken>('PersonalAccessToken')
      .countDocuments({ uid: userid })

    return count
  }

  async removeOne(userid: ObjectId, id: ObjectId) {
    const doc = await this.db
      .collection<PersonalAccessToken>('PersonalAccessToken')
      .findOneAndDelete({ _id: id, uid: userid })

    return doc.value
  }
}
