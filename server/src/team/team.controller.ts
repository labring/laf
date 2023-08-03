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
import { TeamService } from './team.service'
import { User } from 'src/user/entities/user'
import { InjectApplication, InjectTeam, InjectUser } from 'src/utils/decorator'
import { CreateTeamDto } from './dto/create-team.dto'
import { ObjectId } from 'mongodb'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import { UpdateTeamDto } from './dto/update-team.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { Team, TeamWithRole } from './entities/team'
import { TeamRole } from './entities/team-member'
import { TeamAuthGuard } from './team-auth.guard'
import { TeamRoles } from './team-role.decorator'
import { TeamInviteService } from './team-invite/team-invite.service'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { ApplicationWithRelations } from 'src/application/entities/application'

@ApiTags('Team')
@ApiBearerAuth('Authorization')
@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly inviteService: TeamInviteService,
  ) {}

  @ApiOperation({ summary: 'Find internal team of the application' })
  @ApiResponseObject(Team)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get('application/:appid/team')
  async findTeamByAppId(
    @Param('appid') appid: string,
    @InjectApplication() app: ApplicationWithRelations,
  ) {
    const team = await this.teamService.findTeamByAppid(appid)
    if (!team) {
      const team = await this.teamService.create(appid, app.createdBy, appid)
      return ResponseUtil.ok(team)
    }
    return ResponseUtil.ok(team)
  }

  @ApiOperation({ summary: 'Get team by invite code' })
  @ApiResponseObject(Team)
  @Get('invite/code/:code/team')
  async findTeamByInviteCode(@Param('code') code: string) {
    const inviteCode = await this.inviteService.findOneByCode(code)
    if (!inviteCode) {
      return ResponseUtil.error('invite code not found')
    }

    const team = await this.teamService.findOne(inviteCode.teamId)
    return ResponseUtil.ok(team)
  }

  @ApiOperation({ summary: 'Get team list of the user' })
  @ApiResponseArray(Team)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@InjectUser() user: User) {
    const res = await this.teamService.findAll(user._id)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Create team for the user' })
  @ApiResponseObject(Team)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateTeamDto, @InjectUser() user: User) {
    const count = await this.teamService.countTeams(user._id)
    if (count > 20) {
      return ResponseUtil.error('team count limit exceeded')
    }
    const res = await this.teamService.create(dto.name, user._id)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Delete a team' })
  @ApiResponseObject(Team)
  @TeamRoles(TeamRole.Owner)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Delete(':teamId')
  async delete(
    @Param('teamId') teamId: string,
    @InjectTeam() team: TeamWithRole,
  ) {
    if (team.appid) {
      return ResponseUtil.error('cannot delete the internal team')
    }

    const res = await this.teamService.delete(new ObjectId(teamId))
    if (!res) {
      return ResponseUtil.error('failed to delete team')
    }
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Get detail of a team' })
  @ApiResponseObject(Team)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Get(':teamId')
  async findOne(@Param('teamId') teamId: string) {
    const res = await this.teamService.findOne(new ObjectId(teamId))
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Update team' })
  @ApiResponseObject(Team)
  @TeamRoles(TeamRole.Admin)
  @UseGuards(JwtAuthGuard, TeamAuthGuard)
  @Patch(':teamId')
  async updateTeam(
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
  ) {
    const res = await this.teamService.update(new ObjectId(teamId), {
      name: dto.name,
    })
    return ResponseUtil.ok(res)
  }
}
