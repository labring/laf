import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AppsModule } from './apps/apps.module'
import { CollectionsModule } from './collections/collections.module'
import { WebsitesModule } from './websites/websites.module'
import { BucketsModule } from './buckets/buckets.module'
import { PoliciesModule } from './policies/policies.module'
import { FunctionsModule } from './functions/functions.module'
import { ConfigModule } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'
import { CoreModule } from './core/core.module'
import { DemoModule } from './demo/demo.module';
import { TestService } from './test/test.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    AppsModule,
    FunctionsModule,
    PoliciesModule,
    BucketsModule,
    WebsitesModule,
    CollectionsModule,
    HttpModule,
    CoreModule,
    DemoModule,
  ],
  controllers: [AppController],
  providers: [AppService, TestService],
})
export class AppModule {}
