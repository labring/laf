import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { ApplicationService } from '../application/application.service'
import { IRequest } from '../utils/interface'
import { User } from 'src/user/entities/user'
import { TeamMemberService } from 'src/team/team-member/team-member.service'

@Injectable()
export class ApplicationAuthGuard implements CanActivate {
  logger = new Logger(ApplicationAuthGuard.name)
  constructor(
    private readonly appService: ApplicationService,
    private readonly memberService: TeamMemberService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const appid = request.params.appid
    const user = request.user as User

    const app = await this.appService.findOne(appid)
    if (!app) {
      return false
    }

    const members = await this.memberService.find(app.teamId)
    const member = members.find((m) => m.uid.equals(user._id))
    if (!member) {
      return false
    }

    // inject app to request
    request.application = app
    return true
  }
}
