import { PartialType } from '@nestjs/swagger'
import { CreateTriggerDto } from './create-trigger.dto'

export class UpdateTriggerDto extends PartialType(CreateTriggerDto) {}
