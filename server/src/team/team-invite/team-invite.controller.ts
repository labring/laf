import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ObjectId } from 'mongodb'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { TeamRole } from '../entities/team-member'
import { TeamInviteCode } from '../entities/team-invite-code'
import { TeamAuthGuard } from '../team-auth.guard'
import { TeamRoles } from '../team-role.decorator'
import { TeamInviteService } from './team-invite.service'
import { GenerateTeamInviteCodeDto } from '../dto/update-team-invite-code.dto'
import { FindTeamInviteCodeDto } from '../dto/find-team-invite-code.dto'

@ApiTags('Team')
@ApiBearerAuth('Authorization')
@Controller('team/:teamId/invite')
export class TeamInviteController {
  constructor(private readonly inviteService: TeamInviteService) {}

  @ApiOperation({ summary: 'Get team invite code' })
  @ApiResponseArray(FindTeamInviteCodeDto)
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
  @Post('code')
  async generateInviteCode(
    @Body() dto: GenerateTeamInviteCodeDto,
    @Param('teamId') teamId: string,
  ) {
    const res = await this.inviteService.generateInviteCode(
      new ObjectId(teamId),
      {
        role: dto.role,
      },
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Reset team invite code' })
  @ApiResponseObject(TeamInviteCode)
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Delete('code/:code')
  async deleteInviteCode(
    @Param('teamId') teamId: string,
    @Param('code') code: string,
  ) {
    const inviteCode = await this.inviteService.findOneByCode(code)
    if (!inviteCode) {
      return ResponseUtil.error('invite code not found')
    }
    await this.inviteService.deleteInviteCode(inviteCode)
    return ResponseUtil.ok(inviteCode)
  }
}
