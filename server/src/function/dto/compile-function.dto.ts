import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CompileFunctionDto {
  @ApiProperty({
    description: 'The source code of the function',
  })
  @IsNotEmpty()
  @IsString()
  code: string
}
