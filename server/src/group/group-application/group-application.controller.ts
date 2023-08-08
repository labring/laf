import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { GroupApplicationService } from './group-application.service'
import { ObjectId } from 'mongodb'
import { GroupRoles } from '../group-role.decorator'
import { GroupRole } from '../entities/group-member'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { GroupAuthGuard } from '../group-auth.guard'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  ApiResponseArray,
  ApiResponseObject,
  ResponseUtil,
} from 'src/utils/response'
import { GroupApplication } from '../entities/group-application'
import { ApplicationAuthGuard } from 'src/authentication/application.auth.guard'
import { InjectApplication, InjectGroup, InjectUser } from 'src/utils/decorator'
import { ApplicationWithRelations } from 'src/application/entities/application'
import { User } from 'src/user/entities/user'
import { GroupWithRole } from '../entities/group'

@ApiTags('Group')
@ApiBearerAuth('Authorization')
@Controller('group')
export class GroupApplicationController {
  constructor(
    private readonly groupApplicationService: GroupApplicationService,
  ) {}

  @ApiOperation({ summary: 'Append an application to a group' })
  @ApiResponseObject(GroupApplication)
  @GroupRoles(GroupRole.Owner)
  @UseGuards(JwtAuthGuard, ApplicationAuthGuard, GroupAuthGuard)
  @Post(':groupId/application/:appid')
  async append(
    @Param('groupId') groupId: string,
    @Param('appid') appid: string,
    @InjectApplication() app: ApplicationWithRelations,
    @InjectUser() user: User,
  ) {
    if (!app.createdBy.equals(user._id)) {
      throw new HttpException('application not found', HttpStatus.NOT_FOUND)
    }
    const groupApp = await this.groupApplicationService.findOne(
      new ObjectId(groupId),
      appid,
    )
    if (groupApp) {
      return ResponseUtil.error('application already appended')
    }
    const res = await this.groupApplicationService.append(
      new ObjectId(groupId),
      appid,
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Get application list of a group' })
  @ApiResponseArray(GroupApplication)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Get(':groupId/application')
  async find(@Param('groupId') groupId: string) {
    const res = await this.groupApplicationService.find(new ObjectId(groupId))
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Remove an application from a group' })
  @ApiResponseArray(GroupApplication)
  @GroupRoles(GroupRole.Owner)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Delete(':groupId/application/:appid')
  async remove(
    @Param('groupId') groupId: string,
    @Param('appid') appid: string,
    @InjectGroup() group: GroupWithRole,
  ) {
    if (group.appid === appid) {
      return ResponseUtil.error('cannot remove the default application')
    }
    const app = await this.groupApplicationService.findOne(
      new ObjectId(groupId),
      appid,
    )
    if (!app) {
      throw new HttpException('application not found', HttpStatus.NOT_FOUND)
    }
    await this.groupApplicationService.remove(new ObjectId(groupId), appid)
    return ResponseUtil.ok(app)
  }
}
