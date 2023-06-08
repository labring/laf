import { ObjectId } from 'mongodb'
import { CreateEnvironmentDto } from '../../application/dto/create-env.dto'
import { CreateDependencyDto } from 'src/dependency/dto/create-dependency.dto'
import { CloudFunctionSource } from 'src/function/entities/cloud-function'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { HTTP_METHODS } from '../../constants'
import { HttpMethod } from '../../function/entities/cloud-function'
import { FunctionTemplateItemDto } from './create-function-template.dto'

export class UpdateFunctionTemplateDto {
  @ApiProperty({ description: 'Function template id' })
  functionTemplateId: ObjectId

  @ApiProperty({ description: 'Template name' })
  @IsNotEmpty()
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

  @ApiPropertyOptional({ description: 'Template description' })
  @IsString()
  description?: string

  @ApiPropertyOptional({
    description: 'Template items',
    type: [FunctionTemplateItemDto],
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FunctionTemplateItemDto)
  items: FunctionTemplateItemDto[]
}
