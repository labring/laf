import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class GithubJumpLoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  redirectUri: string
}
