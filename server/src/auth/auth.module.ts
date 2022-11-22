import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { Config } from 'src/constants'
import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { CasdoorService } from './casdoor.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: Config.JWT_SECRET,
      signOptions: { expiresIn: Config.JWT_EXPIRES_IN },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, CasdoorService],
  exports: [AuthService],
})
export class AuthModule {}
