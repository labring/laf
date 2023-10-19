import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class GithubSigninDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string
}
