import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { IRequest } from 'src/common/types'
import { ApplicationsService } from './applications.service'

@Injectable()
export class ApplicationAuthGuard implements CanActivate {
  logger = new Logger(ApplicationAuthGuard.name)
  constructor(private appService: ApplicationsService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const appid = request.params.appid
    const user = request.user as User
    this.logger.debug(`check auth of: appid: ${appid}, user: ${user.id}`)
    const app = await this.appService.findOneByUser(user.id, appid)
    if (!app) {
      return false
    }

    // inject app to request
    request.application = app
    return true
  }
}
