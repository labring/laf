import { ApiProperty } from '@nestjs/swagger'
import {
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

export class BindPhoneDto {
  @ApiProperty({
    description: 'old phone number',
    example: '13805718888',
  })
  @IsString()
  @IsOptional()
  @IsMobilePhone('zh-CN')
  oldPhoneNumber?: string

  @ApiProperty({
    description: 'new phone number',
    example: '13805718888',
  })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('zh-CN')
  newPhoneNumber: string

  @ApiProperty({
    description: 'sms verify code for old phone number',
    example: '032476',
  })
  @IsOptional()
  @Length(6, 6)
  oldSmsCode?: string

  @ApiProperty({
    description: 'sms verify code for new phone number',
    example: '032476',
  })
  @IsNotEmpty()
  @Length(6, 6)
  newSmsCode: string
}
