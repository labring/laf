import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AppsModule } from './apps/apps.module'
import { AuthModule } from './auth/auth.module'
import { CollectionsModule } from './collections/collections.module'
import { WebsitesModule } from './websites/websites.module'
import { BucketsModule } from './buckets/buckets.module'
import { PoliciesModule } from './policies/policies.module'
import { FunctionsModule } from './functions/functions.module'
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AppsModule,
    FunctionsModule,
    PoliciesModule,
    BucketsModule,
    WebsitesModule,
    CollectionsModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
