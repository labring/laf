import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ServerConfig } from '../constants'
import { SmsModule } from 'src/sms/sms.module'
import { UserModule } from '../user/user.module'
import { AuthService } from './auth.service'
import { CasdoorService } from './casdoor.service'
import { JwtStrategy } from './jwt.strategy'
import { AuthController } from './auth.controller'
import { HttpModule } from '@nestjs/axios'
import { PatService } from 'src/user/pat.service'
import SMSservice from 'src/sms/sms.service'
import SettingsService from 'src/settings/settings.service'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: ServerConfig.JWT_EXPIRES_IN },
    }),
    UserModule,
    HttpModule,
    SmsModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    CasdoorService,
    PatService,
    SMSservice,
    SettingsService,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
