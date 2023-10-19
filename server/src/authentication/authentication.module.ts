import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ServerConfig } from '../constants'
import { UserModule } from '../user/user.module'
import { AccountModule } from 'src/account/account.module'
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
import { AccountService } from 'src/account/account.service'
import { EmailService } from './email/email.service'
import { EmailController } from './email/email.controller'
import { MailerService } from './email/mailer.service'
import { GithubAuthController } from './github/github.controller'
import { GithubService } from './github/github.service'

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
    AccountModule,
  ],
  providers: [
    JwtStrategy,
    PatService,
    UserPasswordService,
    PhoneService,
    SmsService,
    EmailService,
    AuthenticationService,
    AccountService,
    MailerService,
    GithubService,
  ],
  exports: [SmsService, EmailService],
  controllers: [
    UserPasswordController,
    PhoneController,
    AuthenticationController,
    EmailController,
    GithubAuthController,
  ],
})
export class AuthenticationModule {}
