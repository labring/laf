import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CollectionsModule } from './collections/collections.module'
import { WebsitesModule } from './websites/websites.module'
import { BucketsModule } from './buckets/buckets.module'
import { PoliciesModule } from './policies/policies.module'
import { FunctionsModule } from './functions/functions.module'
import { HttpModule } from '@nestjs/axios'
import { CoreModule } from './core/core.module'
import { ApplicationsModule } from './applications/applications.module'
import { AuthModule } from './auth/auth.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { InitializerModule } from './initializer/initializer.module'
import { InstanceModule } from './instance/instance.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    FunctionsModule,
    PoliciesModule,
    BucketsModule,
    WebsitesModule,
    CollectionsModule,
    HttpModule,
    AuthModule,
    CoreModule,
    ApplicationsModule,
    InitializerModule,
    InstanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
