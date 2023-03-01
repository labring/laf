import { Injectable, Logger } from '@nestjs/common'
import { GenerateAlphaNumericPassword } from 'src/utils/random'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePATDto } from './dto/create-pat.dto'

@Injectable()
export class PatService {
  private readonly logger = new Logger(PatService.name)

  constructor(private readonly prisma: PrismaService) {}

  async create(userid: string, dto: CreatePATDto) {
    const { name, expiresIn } = dto
    const token = 'laf_' + GenerateAlphaNumericPassword(60)

    const pat = await this.prisma.personalAccessToken.create({
      data: {
        name,
        token,
        expiredAt: new Date(Date.now() + expiresIn * 1000),
        user: {
          connect: { id: userid },
        },
      },
    })
    return pat
  }

  async findAll(userid: string) {
    const pats = await this.prisma.personalAccessToken.findMany({
      where: { uid: userid },
      select: {
        id: true,
        uid: true,
        name: true,
        expiredAt: true,
        createdAt: true,
      },
    })
    return pats
  }

  async findOne(token: string) {
    const pat = await this.prisma.personalAccessToken.findFirst({
      where: { token },
      include: {
        user: true,
      },
    })
    return pat
  }

  async count(userid: string) {
    const count = await this.prisma.personalAccessToken.count({
      where: { uid: userid },
    })
    return count
  }

  async remove(userid: string, id: string) {
    const pat = await this.prisma.personalAccessToken.deleteMany({
      where: { id, uid: userid },
    })
    return pat
  }
}
