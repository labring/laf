import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { ApplicationService } from '../application/application.service'
import { IRequest } from '../utils/interface'
import { User } from 'src/user/entities/user'
import { GroupService } from 'src/group/group.service'
import { getRoleLevel } from 'src/group/entities/group-member'
import { Reflector } from '@nestjs/core'

@Injectable()
export class ApplicationAuthGuard implements CanActivate {
  logger = new Logger(ApplicationAuthGuard.name)
  constructor(
    private readonly appService: ApplicationService,
    private readonly groupService: GroupService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const appid = request.params.appid
    const user = request.user as User

    // check appid
    const app = await this.appService.findOne(appid)
    if (!app) {
      return false
    }

    const ok = await this.checkGroupAuth(appid, user, context)
    if (!ok && !app.createdBy.equals(user._id)) {
      return false
    }
    if (!ok) {
      await this.groupService.create(appid, user._id, appid)
      await this.checkGroupAuth(appid, user, context)
    }

    // inject app to request
    request.application = app

    return true
  }

  async checkGroupAuth(appid: string, user: User, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest

    // check group
    const groups = await this.groupService.findGroupsByAppidAndUid(
      appid,
      user._id,
    )
    if (groups.length === 0) {
      return false
    }

    groups.sort((a, b) => getRoleLevel(b.role) - getRoleLevel(a.role))
    const group = groups[0]

    // check group role
    const roles = this.reflector.get<string[]>(
      'group-roles',
      context.getHandler(),
    )
    if (roles?.length > 0) {
      const roleLevels = roles.map(getRoleLevel).sort((a, b) => a - b)

      if (roleLevels[0] > getRoleLevel(group.role)) {
        return false
      }
    }

    request.group = group

    return true
  }
}
