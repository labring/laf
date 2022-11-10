import { PartialType } from '@nestjs/mapped-types';
import { CreatePolicyDto } from './create-policy.dto';

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {}
