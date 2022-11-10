import { PartialType } from '@nestjs/mapped-types';
import { CreateAppDto } from './create-app.dto';

export class UpdateAppDto extends PartialType(CreateAppDto) {}
