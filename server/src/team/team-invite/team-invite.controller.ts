import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { UpdateTeamInviteCodeDto } from '../dto/update-team-invite-code.dto'
import { ApiResponseObject, ResponseUtil } from 'src/utils/response'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { TeamRole } from '../entities/team-member'
import { TeamInviteCode } from '../entities/team-invite-code'
import { TeamAuthGuard } from '../team-auth.guard'
import { TeamRoles } from '../team-role.decorator'
import { TeamInviteService } from './team-invite.service'

@ApiTags('Team')
@ApiBearerAuth('Authorization')
@Controller('team/:teamId/invite')
export class TeamInviteController {
  constructor(private readonly inviteService: TeamInviteService) {}

  @ApiOperation({ summary: 'Get team invite code' })
  @ApiResponseObject(TeamInviteCode)
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Get('code')
  async getInviteCode(@Param('teamId') teamId: string) {
    const res = await this.inviteService.getInviteCode(new ObjectId(teamId))
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Update team invite code' })
  @ApiResponseObject(TeamInviteCode)
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Patch('code')
  async updateInviteCode(
    @Body() dto: UpdateTeamInviteCodeDto,
    @Param('teamId') teamId: string,
  ) {
    const code = await this.inviteService.getInviteCode(new ObjectId(teamId))
    if (!code) {
      return ResponseUtil.error('invite code not found')
    }
    const res = await this.inviteService.updateInviteCode(
      new ObjectId(teamId),
      {
        enable: dto.enable,
      },
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Reset team invite code' })
  @ApiResponseObject(TeamInviteCode)
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Post('code/reset')
  async resetInviteCode(@Param('teamId') teamId: string) {
    const res = await this.inviteService.resetInviteCode(new ObjectId(teamId))
    return ResponseUtil.ok(res)
  }
}
