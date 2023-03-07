import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, Length, IsString } from 'class-validator'
import { Capture, Restore } from '@lafjs/backup-interfaces';

export type ResBody = (Capture.Document | Restore.Document)[];
