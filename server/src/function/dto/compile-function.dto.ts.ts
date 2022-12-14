import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CompileFunctionDto {
  @ApiProperty({
    description: 'The source code of the function',
  })
  @IsNotEmpty()
  code: string
}
