import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, Length, IsString } from 'class-validator'
import { Capture } from '@lafjs/backup-interfaces';


export class ReqBody {
	@IsString({ each: true })
	@ApiProperty()
	collNames: string[];
}

export type ResBody = Capture.Document.Orphan;
