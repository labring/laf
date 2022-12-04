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

@Module({
  imports: [
    FunctionsModule,
    PoliciesModule,
    BucketsModule,
    WebsitesModule,
    CollectionsModule,
    HttpModule,
    AuthModule,
    CoreModule,
    ApplicationsModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    InitializerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
