import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { User } from 'src/user/entities/user'
import { InjectTeamRole, InjectUser } from 'src/utils/decorator'
import { ObjectId } from 'mongodb'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import { UpdateTeamMemberRoleDto } from '../dto/update-team-member-role.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { TeamMember, TeamRole, getRoleLevel } from '../entities/team-member'
import { TeamAuthGuard } from '../team-auth.guard'
import { TeamRoles } from '../team-role.decorator'
import { TeamMemberService } from './team-member.service'
import { TeamInviteService } from '../team-invite/team-invite.service'
import { TeamService } from '../team.service'

@ApiTags('Team')
@ApiBearerAuth('Authorization')
@Controller('team')
export class TeamMemberController {
  constructor(
    private readonly memberService: TeamMemberService,
    private readonly inviteService: TeamInviteService,
    private readonly teamService: TeamService,
  ) {}

  @ApiOperation({ summary: 'Get members of a team' })
  @ApiResponseArray(TeamMember)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Get(':teamId/member')
  async findMembers(@Param('teamId') teamId: string) {
    const res = await this.memberService.find(new ObjectId(teamId))
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Join a team' })
  @ApiResponseObject(TeamMember)
  @UseGuards(JwtAuthGuard)
  @Post(':code/member/join')
  async addMember(@Param('code') code: string, @InjectUser() user: User) {
    const inviteCode = await this.inviteService.findOneByCode(code)
    if (!inviteCode) {
      return ResponseUtil.error('invite code not found')
    }
    if (!inviteCode.enable) {
      return ResponseUtil.error('invite code disabled')
    }
    const member = await this.memberService.findOne(inviteCode.teamId, user._id)
    if (member) {
      return ResponseUtil.error('user has already joined')
    }

    const team = await this.teamService.findOne(inviteCode.teamId)
    if (!team) {
      return ResponseUtil.error('team not found')
    }

    const res = await this.memberService.addOne(inviteCode.teamId, user._id)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Remove a team member' })
  @ApiResponseObject(TeamMember)
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Delete(':teamId/member/:userId')
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @InjectUser() user: User,
    @InjectTeamRole() role: TeamRole,
  ) {
    if (user._id.equals(userId)) {
      return ResponseUtil.error('cannot remove yourself')
    }

    const member = await this.memberService.findOne(
      new ObjectId(teamId),
      user._id,
    )
    if (getRoleLevel(member.role) < getRoleLevel(role)) {
      return ResponseUtil.error('you must have higher permission')
    }

    const [ok, res] = await this.memberService.removeOne(
      new ObjectId(teamId),
      new ObjectId(userId),
    )
    if (!ok) {
      return ResponseUtil.error('failed to remove member')
    }
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Update the role of a member' })
  @ApiResponseObject(TeamMember)
  @TeamRoles(TeamRole.Owner)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Patch(':teamId/member/:userId/role')
  async updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateTeamMemberRoleDto,
    @InjectUser() user: User,
  ) {
    if (user._id.equals(userId)) {
      return ResponseUtil.error('cannot update your own role')
    }
    if (dto.role === TeamRole.Owner) {
      return ResponseUtil.error('cannot update role to owner')
    }
    const res = await this.memberService.updateRole(
      new ObjectId(teamId),
      new ObjectId(userId),
      dto.role,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Leave a team' })
  @ApiResponseObject(TeamMember)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Post(':teamId/member/leave')
  async leaveTeam(@Param('teamId') teamId: string, @InjectUser() user: User) {
    const [ok, res] = await this.memberService.leaveTeam(
      new ObjectId(teamId),
      user._id,
    )
    if (!ok) {
      return ResponseUtil.error(res as string)
    }
    return ResponseUtil.ok(res)
  }
}
