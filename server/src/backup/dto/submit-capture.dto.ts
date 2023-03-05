import { ApiProperty } from '@nestjs/swagger'
import { BucketPolicy } from '@prisma/client'
import { IsEnum, IsNotEmpty, Length, IsString } from 'class-validator'
import * as Capture from '@lafjs/backup/build/tasks/capture';

export class ReqBody {
	@IsString({ each: true })
	@ApiProperty()
	collNames: string[];
}

export type ResBody = Capture.Document.Orphan;
