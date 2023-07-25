import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { SystemDatabase } from 'src/system-database'
import { UserProfile } from 'src/user/entities/user-profile'

@Injectable()
export class InterceptorService {
  private readonly logger = new Logger(InterceptorService.name)
  private readonly db = SystemDatabase.db
  private readonly blockList = ['/v1/applications']
  async interceptor(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    console.log(request.url)
    console.log(request.user)
    // console.log(request.user['_id'])
    // const isAnonymous = await this.interceptAnonymousUser(request.user['_id'])
    // if (isAnonymous) {
    // throw new ForbiddenException('This URL is not allowed')
    // }
    return null
  }
  async interceptAnonymousUser(userId: ObjectId) {
    const userProfile = await this.db
      .collection<UserProfile>('UserProfile')
      .findOne({ uid: userId })
    if (userProfile) {
      return true
    }
  }
}
