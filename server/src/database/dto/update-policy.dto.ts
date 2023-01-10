import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
export class UpdatePolicyDto {
  @ApiProperty()
  @IsNotEmpty()
  injector: string
}
