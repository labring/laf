import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ServerConfig } from '../constants'
import { UserModule } from '../user/user.module'
import { JwtStrategy } from './jwt.strategy'
import { HttpModule } from '@nestjs/axios'
import { PatService } from 'src/user/pat.service'
import { UserPasswordController } from './user-passwd/user-password.controller'
import { UserPasswordService } from './user-passwd/user-password.service'
import { PhoneController } from './phone/phone.controller'
import { PhoneService } from './phone/phone.service'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { SmsService } from './phone/sms.service'

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: ServerConfig.JWT_EXPIRES_IN },
    }),
    UserModule,
    HttpModule,
  ],
  providers: [
    JwtStrategy,
    PatService,
    UserPasswordService,
    PhoneService,
    SmsService,
    AuthenticationService,
  ],
  exports: [SmsService],
  controllers: [
    UserPasswordController,
    PhoneController,
    AuthenticationController,
  ],
})
export class AuthenticationModule {}
