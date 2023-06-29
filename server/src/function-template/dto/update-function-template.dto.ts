import { ObjectId } from 'mongodb'
import { CreateEnvironmentDto } from '../../application/dto/create-env.dto'
import { CreateDependencyDto } from 'src/dependency/dto/create-dependency.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayMaxSize,
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { FunctionTemplateItemDto } from './create-function-template.dto'

export class UpdateFunctionTemplateDto {
  @ApiProperty({ description: 'Function template id' })
  @IsNotEmpty()
  @Length(24, 24)
  functionTemplateId: ObjectId

  @ApiProperty({ description: 'Template name' })
  @IsNotEmpty()
  @MaxLength(32)
  @IsString()
  name: string

  @ApiProperty({ description: 'Dependencies', type: [CreateDependencyDto] })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateDependencyDto)
  dependencies: CreateDependencyDto[]

  @ApiProperty({ description: 'Environments', type: [CreateEnvironmentDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateEnvironmentDto)
  environments: CreateEnvironmentDto[]

  @ApiProperty({ description: 'Private flag' })
  @IsBoolean()
  private: boolean

  @ApiPropertyOptional({ description: 'function template description' })
  @IsString()
  @MaxLength(256)
  @MinLength(8)
  description?: string

  @ApiPropertyOptional({
    description: 'items of the function template',
    type: [FunctionTemplateItemDto],
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @ArrayMaxSize(20)
  @Type(() => FunctionTemplateItemDto)
  items: FunctionTemplateItemDto[]
}
