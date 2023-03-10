import { Module } from '@nestjs/common'
import { RegionModule } from '../region/region.module'
import { DatabaseModule } from '../database/database.module'
import { BackupController } from './backup.controller';
import assert = require('assert');
import { Publisher } from '@lafjs/mongo-async-rpc';


assert(process.env.TASKLIST_HOST_URI);
assert(process.env.TASKLIST_DB_NAME);
assert(process.env.TASKLIST_COLL_NAME);


@Module({
	imports: [DatabaseModule, RegionModule],
	controllers: [BackupController],
	providers: [{
		provide: 'publisher',
		useValue: new Publisher(
			process.env.TASKLIST_HOST_URI,
			process.env.TASKLIST_DB_NAME,
			process.env.TASKLIST_COLL_NAME,
		),
	}],
})
export class BackupModule { }
