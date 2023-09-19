import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class GithubBind {
  @ApiProperty({ description: 'temporary token signed for github bindings' })
  @IsString()
  @IsNotEmpty()
  token: string

  @ApiProperty({ description: 'Is a newly registered use' })
  @IsBoolean()
  @IsOptional()
  isRegister: boolean
}
