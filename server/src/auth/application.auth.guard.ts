import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { ApplicationService } from '../application/application.service'
import { IRequest } from '../utils/interface'

@Injectable()
export class ApplicationAuthGuard implements CanActivate {
  logger = new Logger(ApplicationAuthGuard.name)
  constructor(private appService: ApplicationService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const appid = request.params.appid
    const user = request.user as User
    this.logger.debug(`check auth of: appid: ${appid}, user: ${user.id}`)

    const app = await this.appService.findOne(appid)
    if (!app) {
      return false
    }

    // Call toString() to convert to string in case it is ObjectID
    const author_id = app.createdBy?.toString()
    if (author_id !== user.id) {
      return false
    }

    // inject app to request
    request.application = app
    return true
  }
}
