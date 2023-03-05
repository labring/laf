import { ApiProperty } from '@nestjs/swagger'
import { BucketPolicy } from '@prisma/client'
import { IsEnum, IsNotEmpty, Length, IsString } from 'class-validator'
import * as Restore from '@lafjs/backup/build/tasks/restore';

export class ReqBody {
	@IsString()
	@ApiProperty()
	fileName: string;
}

export type ResBody = Restore.Document.Orphan;
