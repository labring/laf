import { ApiProperty } from '@nestjs/swagger'
import { BucketPolicy } from '@prisma/client'
import { IsEnum, IsNotEmpty, Length, IsString } from 'class-validator'
import * as Capture from '@lafjs/backup/build/tasks/capture';
import * as Restore from '@lafjs/backup/build/tasks/restore';

export type ResBody = (Capture.Document | Restore.Document)[];
