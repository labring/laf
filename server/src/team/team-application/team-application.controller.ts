import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common'
import { TeamApplicationService } from './team-application.service'
import { ObjectId } from 'mongodb'
import { TeamRoles } from '../team-role.decorator'
import { TeamRole } from '../entities/team-member'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { TeamAuthGuard } from '../team-auth.guard'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import { TeamApplication } from '../entities/team-application'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { InjectApplication, InjectUser } from 'src/utils/decorator'
import { ApplicationWithRelations } from 'src/application/entities/application'
import { User } from 'src/user/entities/user'

@ApiTags('Team')
@ApiBearerAuth('Authorization')
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
  async append(
    @Param('teamId') teamId: string,
    @Param('appid') appid: string,
    @InjectApplication() app: ApplicationWithRelations,
    @InjectUser() user: User,
  ) {
    if (!app.createdBy.equals(user._id)) {
      return ResponseUtil.error('application not found')
    }
    const teamApp = await this.teamApplicationService.findOne(
      new ObjectId(teamId),
      appid,
    )
    if (teamApp) {
      return ResponseUtil.error('application already appended')
    }
    const res = await this.teamApplicationService.append(
      new ObjectId(teamId),
      appid,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Get application list of a team' })
  @ApiResponseArray(TeamApplication)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Get(':teamId/application')
  async find(@Param('teamId') teamId: string) {
    const res = await this.teamApplicationService.find(new ObjectId(teamId))
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Remove an application from a team' })
  @ApiResponseArray(TeamApplication)
  @TeamRoles(TeamRole.Owner)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Delete(':teamId/application/:appid')
  async remove(@Param('teamId') teamId: string, @Param('appid') appid: string) {
    const app = this.teamApplicationService.findOne(new ObjectId(teamId), appid)
    if (!app) {
      return ResponseUtil.error('application not found')
    }
    await this.teamApplicationService.remove(new ObjectId(teamId), appid)
    return ResponseUtil.ok(app)
  }
}
