import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { UserService } from './user.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { IRequest, IResponse } from 'src/utils/interface'
import { ApiResponseObject, ResponseUtil } from 'src/utils/response'
import { JwtAuthGuard } from 'src/authentication/jwt.auth.guard'
import { User, UserWithProfile } from './entities/user'
import { SmsService } from 'src/authentication/phone/sms.service'
import { BindPhoneDto } from './dto/bind-phone.dto'
import { SmsVerifyCodeType } from 'src/authentication/entities/sms-verify-code'
import { BindUsernameDto } from './dto/bind-username.dto'
import { UpdateAvatarDto } from './dto/update-avatar.dto'
import { ObjectId } from 'mongodb'
import { EmailService } from 'src/authentication/email/email.service'
import { EmailVerifyCodeType } from 'src/authentication/entities/email-verify-code'
import { BindEmailDto } from './dto/bind-email.dto'
import { QuotaService } from './quota.service'
import { InjectUser } from 'src/utils/decorator'

@ApiTags('User')
@ApiBearerAuth('Authorization')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
    private readonly quotaServiceTsService: QuotaService,
  ) {}

  /**
   * Update avatar of user
   * @param dto
   * @returns
   */
  @ApiResponseObject(UserWithProfile)
  @ApiOperation({ summary: 'Update avatar of user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateAvatarDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2M
      },
    }),
  )
  async updateAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @Req() req: IRequest,
  ) {
    if (!avatar) {
      return ResponseUtil.error('avatar is required')
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(avatar.mimetype)) {
      return ResponseUtil.error('avatar only supports jpeg/png/gif')
    }

    const user = req.user
    const res = await this.userService.updateAvatar(avatar, user._id)

    return ResponseUtil.ok(res)
  }

  /**
   * Get avatar of user
   * @param dto
   * @returns
   */
  @ApiOperation({ summary: 'Get avatar of user' })
  @Get('avatar/:uid')
  async getAvatar(@Param('uid') uid: string, @Res() res: IResponse) {
    const user = await this.userService.findOneById(new ObjectId(uid))

    if (user.profile.avatar?.startsWith('http')) {
      res.redirect(user.profile.avatar)
      return
    }

    const avatar = await this.userService.getAvatarData(new ObjectId(uid))

    res.set('Content-Type', 'image/webp')
    res.send(avatar)
  }

  /**
   * Bind phone
   */
  @ApiOperation({ summary: 'Bind phone' })
  @ApiResponseObject(UserWithProfile)
  @UseGuards(JwtAuthGuard)
  @Post('bind/phone')
  async bindPhone(@Body() dto: BindPhoneDto, @InjectUser() user: User) {
    const { oldPhoneNumber, newPhoneNumber, oldSmsCode, newSmsCode } = dto
    // check code valid
    if (user.phone) {
      if (!dto.oldPhoneNumber || !dto.oldSmsCode) {
        return ResponseUtil.error(
          'you should provide oldPhoneNumber and oldSmsCode',
        )
      }
      if (user.phone !== dto.oldPhoneNumber) {
        return ResponseUtil.error(
          'the old phone number is not the same as the new one',
        )
      }
      const err = await this.smsService.validateCode(
        oldPhoneNumber,
        oldSmsCode,
        SmsVerifyCodeType.Unbind,
      )
      if (err) {
        return ResponseUtil.error(err)
      }
    }

    const err = await this.smsService.validateCode(
      newPhoneNumber,
      newSmsCode,
      SmsVerifyCodeType.Bind,
    )
    if (err) {
      return ResponseUtil.error(err)
    }

    // check phone if have already been bound
    const _user = await this.userService.findOneByPhone(newPhoneNumber)
    if (_user) {
      return ResponseUtil.error('phone has already been bound')
    }

    // bind phone
    const res = await this.userService.updateUser(user._id, {
      phone: newPhoneNumber,
    })
    return ResponseUtil.ok(res)
  }

  /**
   * Bind email
   */
  @ApiOperation({ summary: 'Bind email' })
  @ApiResponseObject(UserWithProfile)
  @UseGuards(JwtAuthGuard)
  @Post('bind/email')
  async bindEmail(@Body() dto: BindEmailDto, @Req() req: IRequest) {
    const { email, code } = dto

    const err = await this.emailService.validateCode(
      email,
      code,
      EmailVerifyCodeType.Bind,
    )
    if (err) {
      return ResponseUtil.error(err)
    }

    // check email if have already been bound
    const user = await this.userService.findOneByEmail(email)
    if (user) {
      return ResponseUtil.error('email has already been bound')
    }

    // bind email
    const res = await this.userService.updateUser(req.user._id, {
      email,
    })
    return ResponseUtil.ok(res)
  }

  /**
   * Bind username
   */
  @ApiOperation({ summary: 'Bind username' })
  @ApiResponseObject(UserWithProfile)
  @UseGuards(JwtAuthGuard)
  @Post('bind/username')
  async bindUsername(@Body() dto: BindUsernameDto, @Req() req: IRequest) {
    const { username } = dto
    // // check code valid
    // const err = await this.smsService.validateCode(
    //   phone,
    //   code,
    //   SmsVerifyCodeType.Bind,
    // )
    // if (err) {
    //   return ResponseUtil.error(err)
    // }

    // check username if have already been bound
    const user = await this.userService.findOneByUsername(username)
    if (user) {
      return ResponseUtil.error('username already been bound')
    }

    // bind username
    const res = await this.userService.updateUser(req.user._id, { username })
    return ResponseUtil.ok(res)
  }

  /**
   * Get current user profile
   * @param request
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiResponseObject(UserWithProfile)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiBearerAuth('Authorization')
  async getProfile(@Req() request: IRequest) {
    const user = request.user
    return ResponseUtil.ok(user)
  }
}
