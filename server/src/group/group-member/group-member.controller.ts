import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { User } from 'src/user/entities/user'
import { InjectGroup, InjectUser } from 'src/utils/decorator'
import { ObjectId } from 'mongodb'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import { UpdateGroupMemberRoleDto } from '../dto/update-group-member-role.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { GroupMember, GroupRole, getRoleLevel } from '../entities/group-member'
import { GroupAuthGuard } from '../group-auth.guard'
import { GroupRoles } from '../group-role.decorator'
import { GroupMemberService } from './group-member.service'
import { GroupInviteService } from '../group-invite/group-invite.service'
import { GroupService } from '../group.service'
import { GroupWithRole } from '../entities/group'
import { FindGroupMemberDto } from '../dto/find-group-member.dto'

@ApiTags('Group')
@ApiBearerAuth('Authorization')
@Controller('group')
export class GroupMemberController {
  constructor(
    private readonly memberService: GroupMemberService,
    private readonly inviteService: GroupInviteService,
    private readonly groupService: GroupService,
  ) {}

  @ApiOperation({ summary: 'Get members of a group' })
  @ApiResponseArray(FindGroupMemberDto)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Get(':groupId/member')
  async findMembers(@Param('groupId') groupId: string) {
    const res = await this.memberService.find(new ObjectId(groupId))
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Join a group' })
  @ApiResponseObject(GroupMember)
  @UseGuards(JwtAuthGuard)
  @Post(':code/member/join')
  async addMember(@Param('code') code: string, @InjectUser() user: User) {
    const inviteCode = await this.inviteService.findOneByCode(code)
    if (!inviteCode) {
      throw new HttpException('invite code not found', HttpStatus.NOT_FOUND)
    }
    if (inviteCode.usedBy) {
      return ResponseUtil.error('invite code has been used')
    }
    const member = await this.memberService.findOne(
      inviteCode.groupId,
      user._id,
    )
    if (member) {
      return ResponseUtil.error('user has already joined')
    }

    const group = await this.groupService.findOne(inviteCode.groupId)
    if (!group) {
      throw new HttpException('group not found', HttpStatus.NOT_FOUND)
    }

    const res = await this.inviteService.useInviteCode(inviteCode, user)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Remove a group member' })
  @ApiResponseObject(GroupMember)
  @GroupRoles(GroupRole.Admin)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Delete(':groupId/member/:userId')
  async removeMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @InjectUser() user: User,
    @InjectGroup() group: GroupWithRole,
  ) {
    if (user._id.equals(userId)) {
      return ResponseUtil.error('cannot remove yourself')
    }

    const member = await this.memberService.findOne(
      new ObjectId(groupId),
      user._id,
    )
    if (getRoleLevel(member.role) < getRoleLevel(group.role)) {
      return ResponseUtil.error('you must have higher permission')
    }

    const [ok, res] = await this.memberService.removeOne(
      new ObjectId(groupId),
      new ObjectId(userId),
    )
    if (!ok) {
      return ResponseUtil.error('failed to remove member')
    }
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Update the role of a member' })
  @ApiResponseObject(GroupMember)
  @GroupRoles(GroupRole.Owner)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Patch(':groupId/member/:userId/role')
  async updateMemberRole(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateGroupMemberRoleDto,
    @InjectUser() user: User,
  ) {
    if (user._id.equals(userId)) {
      return ResponseUtil.error('cannot update your own role')
    }
    if (![GroupRole.Developer].includes(dto.role)) {
      return ResponseUtil.error('can only update role to developer')
    }
    const res = await this.memberService.updateRole(
      new ObjectId(groupId),
      new ObjectId(userId),
      dto.role,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Leave a group' })
  @ApiResponseObject(GroupMember)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Post(':groupId/member/leave')
  async leaveGroup(
    @Param('groupId') groupId: string,
    @InjectUser() user: User,
    @InjectGroup() group: GroupWithRole,
  ) {
    if (group.role === GroupRole.Owner) {
      return ResponseUtil.error('Owner cannot leave group')
    }
    await this.memberService.leaveGroup(new ObjectId(groupId), user._id)

    return ResponseUtil.ok(group)
  }
}
