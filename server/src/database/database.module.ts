import { Module } from '@nestjs/common'
import { CollectionService } from './collection/collection.service'
import { CollectionController } from './collection/collection.controller'
import { PolicyController } from './policy/policy.controller'
import { PolicyService } from './policy/policy.service'
import { DatabaseService } from './database.service'
import { DatabaseController } from './database.controller'
import { PrismaService } from 'src/prisma.service'
import { PolicyRuleService } from './policy/policy-rule.service'
import { PolicyRuleController } from './policy/policy-rule.controller'
import { MongoService } from './mongo.service'
import { RegionModule } from 'src/region/region.module'
import { ApplicationService } from 'src/application/application.service'

@Module({
  imports: [RegionModule],
  controllers: [
    CollectionController,
    PolicyController,
    DatabaseController,
    PolicyRuleController,
  ],
  providers: [
    CollectionService,
    PolicyService,
    DatabaseService,
    PrismaService,
    PolicyRuleService,
    MongoService,
    ApplicationService,
  ],
  exports: [
    CollectionService,
    PolicyService,
    DatabaseService,
    PrismaService,
    PolicyRuleService,
    MongoService,
  ],
})
export class DatabaseModule {}
