import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
export class UpdatePolicyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  injector: string
}
