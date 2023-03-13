import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ServerConfig } from '../constants'
import { UserModule } from '../user/user.module'
import { AuthService } from './auth.service'
import { CasdoorService } from './casdoor.service'
import { JwtStrategy } from './jwt.strategy'
import { AuthController } from './auth.controller'
import { HttpModule } from '@nestjs/axios'
import { PatService } from 'src/user/pat.service'

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
  providers: [AuthService, JwtStrategy, CasdoorService, PatService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
