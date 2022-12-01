import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ServerConfig } from '../constants'
import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { CasdoorService } from './casdoor.service'
import { JwtStrategy } from './jwt.strategy'
import { AuthController } from './auth.controller'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: ServerConfig.JWT_EXPIRES_IN },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, CasdoorService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
