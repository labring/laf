import { Module } from '@nestjs/common'
import { CollectionService } from './collection/collection.service'
import { CollectionController } from './collection/collection.controller'
import { PolicyController } from './policy/policy.controller'
import { PolicyService } from './policy/policy.service'
import { DatabaseService } from './database.service'
import { DatabaseController } from './database.controller'
import { PolicyRuleService } from './policy/policy-rule.service'
import { PolicyRuleController } from './policy/policy-rule.controller'
import { MongoService } from './mongo.service'
import { ApplicationService } from 'src/application/application.service'
import { BundleService } from 'src/application/bundle.service'
import { DatabaseUsageLimitTaskService } from './database-usage-limit-task.service'
import { DatabaseUsageCaptureTaskService } from './database-usage-capture-task.service'
import { QuotaService } from 'src/user/quota.service'
import { SettingService } from 'src/setting/setting.service'

@Module({
  imports: [],
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
    PolicyRuleService,
    MongoService,
    ApplicationService,
    BundleService,
    DatabaseUsageCaptureTaskService,
    DatabaseUsageLimitTaskService,
    SettingService,
    QuotaService,
  ],
  exports: [
    CollectionService,
    PolicyService,
    DatabaseService,
    PolicyRuleService,
    MongoService,
  ],
})
export class DatabaseModule {}
