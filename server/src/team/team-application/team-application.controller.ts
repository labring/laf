import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { TeamApplicationService } from './team-application.service'
import { ObjectId } from 'mongodb'
import { TeamRoles } from '../team-role.decorator'
import { TeamRole } from '../entities/team-member'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { TeamAuthGuard } from '../team-auth.guard'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import { TeamApplication } from '../entities/team-application'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'

@Controller('team')
export class TeamApplicationController {
  constructor(
    private readonly teamApplicationService: TeamApplicationService,
  ) {}

  @ApiOperation({ summary: 'Append an application to a team' })
  @ApiResponseObject(TeamApplication)
  @TeamRoles(TeamRole.Owner)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard, TeamAuthGuard)
  @Post(':teamId/application/:appid')
  async append(@Param('teamId') teamId: string, @Param('appid') appid: string) {
    const res = await this.teamApplicationService.append(
      new ObjectId(teamId),
      appid,
    )
    return res
  }

  @ApiOperation({ summary: 'Get application list of a team' })
  @ApiResponseArray(TeamApplication)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Get(':teamId/application')
  async find(@Param('teamId') teamId: string) {
    const res = await this.teamApplicationService.find(teamId)
    return res
  }

  @ApiOperation({ summary: 'Remove an application from a team' })
  @ApiResponse({ type: ResponseUtil })
  @TeamRoles(TeamRole.Owner)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Post(':teamId/application/:appid/remove')
  async remove(@Param('teamId') teamId: string, @Param('appid') appid: string) {
    const res = await this.teamApplicationService.remove(
      new ObjectId(teamId),
      appid,
    )
    return res
  }
}
