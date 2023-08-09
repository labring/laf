import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { GroupService } from './group.service'
import { IRequest } from 'src/utils/interface'
import { User } from 'src/user/entities/user'
import { ObjectId } from 'mongodb'
import { Reflector } from '@nestjs/core'
import { getRoleLevel } from './entities/group-member'
import { GroupMemberService } from './group-member/group-member.service'

@Injectable()
export class GroupAuthGuard implements CanActivate {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupMemberService: GroupMemberService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as IRequest
    const user = request.user as User
    const groupId = request.params.groupId

    if (!groupId) {
      return false
    }

    const group = await this.groupService.findOneWithRole(
      new ObjectId(groupId),
      user._id,
    )
    if (!group) {
      return false
    }

    const members = await this.groupMemberService.find(new ObjectId(groupId))
    const member = members.find((m) => m.uid.equals(user._id))
    if (!member) {
      return false
    }

    // inject group to request
    request.group = group

    const roles = this.reflector.get<string[]>(
      'group-roles',
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
