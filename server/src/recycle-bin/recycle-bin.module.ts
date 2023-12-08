import { Module } from '@nestjs/common'
import { FunctionRecycleBinController } from './cloud-function/function-recycle-bin.controller'
import { FunctionRecycleBinService } from './cloud-function/function-recycle-bin.service'
import { FunctionService } from 'src/function/function.service'
import { DatabaseService } from 'src/database/database.service'
import { JwtService } from '@nestjs/jwt'
import { TriggerService } from 'src/trigger/trigger.service'
import { MongoService } from 'src/database/mongo.service'
import { RegionService } from 'src/region/region.service'
import { ApplicationService } from 'src/application/application.service'
import { HttpModule } from '@nestjs/axios'
import { DedicatedDatabaseService } from 'src/database/dedicated-database/dedicated-database.service'

@Module({
  imports: [HttpModule],
  controllers: [FunctionRecycleBinController],
  providers: [
    ApplicationService,
    DatabaseService,
    DedicatedDatabaseService,
    JwtService,
    TriggerService,
    FunctionRecycleBinService,
    FunctionService,
    MongoService,
    RegionService,
  ],
  exports: [FunctionRecycleBinService],
})
export class RecycleBinModule {}
