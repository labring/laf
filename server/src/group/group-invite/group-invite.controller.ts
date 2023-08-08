import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
import { GroupRole } from '../entities/group-member'
import { GroupInviteCode } from '../entities/group-invite-code'
import { GroupAuthGuard } from '../group-auth.guard'
import { GroupRoles } from '../group-role.decorator'
import { GroupInviteService } from './group-invite.service'
import { GenerateGroupInviteCodeDto } from '../dto/update-group-invite-code.dto'
import { FindGroupInviteCodeDto } from '../dto/find-group-invite-code.dto'
import { InjectUser } from 'src/utils/decorator'

@ApiTags('Group')
@ApiBearerAuth('Authorization')
@Controller('group/:groupId/invite')
export class GroupInviteController {
  constructor(private readonly inviteService: GroupInviteService) {}

  @ApiOperation({ summary: 'Get group invite code' })
  @ApiResponseArray(FindGroupInviteCodeDto)
  @GroupRoles(GroupRole.Admin)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Get('code')
  async getInviteCode(@Param('groupId') groupId: string) {
    const res = await this.inviteService.getInviteCode(new ObjectId(groupId))
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Update group invite code' })
  @ApiResponseObject(GroupInviteCode)
  @GroupRoles(GroupRole.Admin)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Post('code')
  async generateInviteCode(
    @Body() dto: GenerateGroupInviteCodeDto,
    @Param('groupId') groupId: string,
    @InjectUser() user,
  ) {
    const res = await this.inviteService.generateInviteCode(
      new ObjectId(groupId),
      {
        createdBy: user._id,
        role: dto.role,
      },
    )
    return ResponseUtil.ok(res)
  }

  @ApiOperation({ summary: 'Delete group invite code' })
  @ApiResponseObject(GroupInviteCode)
  @GroupRoles(GroupRole.Admin)
  @UseGuards(JwtAuthGuard, GroupAuthGuard)
  @Delete('code/:code')
  async deleteInviteCode(@Param('code') code: string) {
    const inviteCode = await this.inviteService.findOneByCode(code)
    if (!inviteCode) {
      throw new HttpException('invite code not found', HttpStatus.NOT_FOUND)
    }
    await this.inviteService.deleteInviteCode(inviteCode)
    return ResponseUtil.ok(inviteCode)
  }
}
