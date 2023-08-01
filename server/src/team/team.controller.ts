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
import { InjectUser } from 'src/utils/decorator'
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
import { Team } from './entities/team'
import { TeamRole } from './entities/team-member'
import { ApplicationService } from 'src/application/application.service'
import { TeamAuthGuard } from './team-auth.guard'
import { TeamRoles } from './team-role.decorator'
import { TeamInviteService } from './team-invite/team-invite.service'

@ApiTags('Team')
@ApiBearerAuth('Authorization')
@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly inviteService: TeamInviteService,
    private readonly applicationService: ApplicationService,
  ) {}

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
    if (count > 40) {
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
  async delete(@Param('teamId') teamId: string) {
    const team = await this.teamService.delete(new ObjectId(teamId))
    if (!team) {
      return ResponseUtil.error('failed to delete team')
    }
    return ResponseUtil.ok(team)
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
