import { PartialType } from '@nestjs/mapped-types';
import { CreateFunctionDto } from './create-function.dto';

export class UpdateFunctionDto extends PartialType(CreateFunctionDto) {}
