import { Module } from '@nestjs/common'
import { RegionModule } from 'src/region/region.module'
import { DatabaseModule } from 'src/database/database.module'
import { BackupController } from './backup.controller';
import assert from 'assert';
import { Publisher } from '@lafjs/mongo-async-rpc';


assert(process.env.TASKLIST_HOST_URI);
assert(process.env.TASKLIST_DB);
assert(process.env.TASKLIST_COLL);


@Module({
	imports: [DatabaseModule, RegionModule],
	controllers: [BackupController],
	providers: [{
		provide: 'publisher',
		useValue: new Publisher(
			process.env.TASKLIST_HOST_URI,
			process.env.TASKLIST_DB,
			process.env.TASKLIST_COLL,
		),
	}],
})
export class BackupModule { }
