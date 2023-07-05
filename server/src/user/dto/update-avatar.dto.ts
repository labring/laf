import { ApiProperty } from '@nestjs/swagger'

export class UpdateAvatarDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: any
}
