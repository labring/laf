import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, Length, IsString } from 'class-validator'
import { Restore } from '@lafjs/backup-interfaces';


export class ReqBody {
	@IsString()
	@ApiProperty()
	fileName: string;
}

export type ResBody = Restore.Document.Orphan;
