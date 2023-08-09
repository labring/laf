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
import { GroupService } from './group.service'
import { User } from 'src/user/entities/user'
import { InjectApplication, InjectGroup, InjectUser } from 'src/utils/decorator'
import { CreateGroupDto } from './dto/create-group.dto'
import { ObjectId } from 'mongodb'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import { UpdateGroupDto } from './dto/update-group.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { Group, GroupWithRole } from './entities/group'
import { GroupRole } from './entities/group-member'
import { GroupAuthGuard } from './group-auth.guard'
import { GroupRoles } from './group-role.decorator'
import { GroupInviteService } from './group-invite/group-invite.service'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { ApplicationWithRelations } from 'src/application/entities/application'
import { GetGroupInviteCodeDetailDto } from './dto/get-group-invite-code-detail.dto'

@ApiTags('Group')
@ApiBearerAuth('Authorization')
@Controller('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly inviteService: GroupInviteService,
  ) {}

  @ApiOperation({ summary: 'Find internal group of the application' })
  @ApiResponseObject(Group)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard)
  @Get('application/:appid/group')
  async findGroupByAppId(
    @Param('appid') appid: string,
    @InjectApplication() app: ApplicationWithRelations,
  ) {
    const group = await this.groupService.findGroupByAppid(appid)
    if (!group) {
      const group = await this.groupService.create(appid, app.createdBy, appid)
      return ResponseUtil.ok(group)
    }
    return ResponseUtil.ok(group)
  }

  @ApiOperation({ summary: 'Get group by invite code' })
  @ApiResponseObject(GetGroupInviteCodeDetailDto)
  @Get('invite/code/:code/group')
  async findGroupByInviteCode(@Param('code') code: string) {
    const inviteCode = await this.inviteService.findOneByCodeDetail(code)
    if (!inviteCode) {
      throw new HttpException('invite code not found', HttpStatus.NOT_FOUND)
    }
    return ResponseUtil.ok(inviteCode)
  }

  @ApiOperation({ summary: 'Get group list of the user' })
  @ApiResponseArray(Group)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@InjectUser() user: User) {
    const res = await this.groupService.findAll(user._id)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Create group for the user' })
  @ApiResponseObject(Group)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateGroupDto, @InjectUser() user: User) {
    const count = await this.groupService.countGroups(user._id)
    if (count > 20) {
      return ResponseUtil.error('group count limit exceeded')
    }
    const res = await this.groupService.create(dto.name, user._id)
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponseObject(Group)
  @GroupRoles(GroupRole.Owner)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Delete(':groupId')
  async delete(
    @Param('groupId') groupId: string,
    @InjectGroup() group: GroupWithRole,
  ) {
    if (group.appid) {
      return ResponseUtil.error('cannot delete the internal group')
    }

    const res = await this.groupService.delete(new ObjectId(groupId))
    if (!res) {
      return ResponseUtil.error('failed to delete group')
    }
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Get detail of a group' })
  @ApiResponseObject(Group)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Get(':groupId')
  async findOne(@Param('groupId') groupId: string) {
    const res = await this.groupService.findOne(new ObjectId(groupId))
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Update group' })
  @ApiResponseObject(Group)
  @GroupRoles(GroupRole.Admin)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Patch(':groupId')
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateGroupDto,
  ) {
    const res = await this.groupService.update(new ObjectId(groupId), {
      name: dto.name,
    })
    return ResponseUtil.ok(res)
  }
}
