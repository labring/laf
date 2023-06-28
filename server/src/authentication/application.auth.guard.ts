import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { ApplicationService } from '../application/application.service'
import { IRequest } from '../utils/interface'
import { User } from 'src/user/entities/user'

@Injectable()
export class ApplicationAuthGuard implements CanActivate {
  logger = new Logger(ApplicationAuthGuard.name)
  constructor(private appService: ApplicationService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const appid = request.params.appid
    const user = request.user as User

    const app = await this.appService.findOne(appid)
    if (!app) {
      return false
    }

    const author_id = app.createdBy?.toString()
    if (author_id !== user._id.toString()) {
      return false
    }

    // inject app to request
    request.application = app
    return true
  }
}
