import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { TeamService } from './team.service'
import { IRequest } from 'src/utils/interface'
import { User } from 'src/user/entities/user'
import { ObjectId } from 'mongodb'
import { Reflector } from '@nestjs/core'
import { getRoleLevel } from './entities/team-member'
import { TeamMemberService } from './team-member/team-member.service'

@Injectable()
export class TeamAuthGuard implements CanActivate {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamMemberService: TeamMemberService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const user = request.user as User
    const teamId = request.params.teamId

    if (!teamId) {
      return false
    }

    const team = await this.teamService.findOneWithRole(
      new ObjectId(teamId),
      user._id,
    )
    if (!team) {
      return false
    }

    const members = await this.teamMemberService.find(new ObjectId(teamId))
    const member = members.find((m) => m.uid.equals(user._id))
    if (!member) {
      return false
    }

    // inject team to request
    request.team = team

    const roles = this.reflector.get<string[]>(
      'team-roles',
      context.getHandler(),
    )
    if (!roles || roles.length === 0) {
      return true
    }

    const roleLevels = roles.map(getRoleLevel).sort((a, b) => a - b)

    if (roleLevels[0] > getRoleLevel(member.role)) {
      return false
    }

    return true
  }
}
