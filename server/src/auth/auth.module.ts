import { SmsService } from 'src/auth/phone/sms.service'
import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ServerConfig } from '../constants'
import { UserModule } from '../user/user.module'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { AuthController } from './auth.controller'
import { HttpModule } from '@nestjs/axios'
import { PatService } from 'src/user/pat.service'
import { UserPasswordController } from './user-passwd/user-password.controller'
import { UserPasswordService } from './user-passwd/user-password.service'
import { PhoneController } from './phone/phone.controller'
import { PhoneService } from './phone/phone.service'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'

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
    AuthService,
    JwtStrategy,
    PatService,
    UserPasswordService,
    PhoneService,
    SmsService,
    AuthenticationService,
  ],
  exports: [AuthService],
  controllers: [
    AuthController,
    UserPasswordController,
    PhoneController,
    AuthenticationController,
  ],
})
export class AuthModule {}
