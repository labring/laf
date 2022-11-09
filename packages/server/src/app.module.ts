import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ApplicationController } from './application/application.controller';
import { AppsModule } from './apps/apps.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { WebsitesModule } from './websites/websites.module';
import { BucketsModule } from './buckets/buckets.module';
import { PoliciesModule } from './policies/policies.module';
import { FunctionsModule } from './functions/functions.module';
import { ApplicationModule } from './application/application.module';
import { AppsModule } from './apps/apps.module';

@Module({
  imports: [AppsModule, ApplicationModule, FunctionsModule, PoliciesModule, BucketsModule, WebsitesModule, CollectionsModule, AuthModule],
  controllers: [AppController, ApplicationController],
  providers: [AppService],
})
export class AppModule {}
