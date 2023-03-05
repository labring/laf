import { Module } from '@nestjs/common'
import { RegionModule } from 'src/region/region.module'
import { DatabaseModule } from 'src/database/database.module'
import { BackupController } from './backup.controller'

@Module({
	imports: [DatabaseModule, RegionModule],
	controllers: [BackupController],
})
export class BackupModule { }
