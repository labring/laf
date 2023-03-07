import { ApiProperty } from '@nestjs/swagger'
import { isNumberString } from 'class-validator'
import { Restore } from '@lafjs/backup-interfaces';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsBackupObjectName() {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			validator: {
				validate(value: any, args: ValidationArguments) {
					if (typeof value !== 'string') return false;
					const splitted = value.split('/');
					if (splitted.length !== 2) return false;
					if (!isNumberString(splitted[1], { no_symbols: true })) return false;
				},
			},
		});
	};
}


export class ReqBody {
	@IsBackupObjectName()
	@ApiProperty()
	objectName: string;
}

export type ResBody = Restore.Document.Orphan;
