import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { WebsiteModule } from './website/website.module'
import { FunctionModule } from './function/function.module'
import { HttpModule } from '@nestjs/axios'
import { ApplicationModule } from './application/application.module'
import { AuthModule } from './auth/auth.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { InitializerModule } from './initializer/initializer.module'
import { InstanceModule } from './instance/instance.module'
import { ScheduleModule } from '@nestjs/schedule'
import { DatabaseModule } from './database/database.module'
import { StorageModule } from './storage/storage.module'
import { LogModule } from './log/log.module'
import { DependencyModule } from './dependency/dependency.module'
import { TriggerModule } from './trigger/trigger.module'
import { RegionModule } from './region/region.module'
import { GatewayModule } from './gateway/gateway.module'
import { PrismaModule } from './prisma/prisma.module'
import { SubscriptionModule } from './subscription/subscription.module'
import { AccountModule } from './account/account.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    FunctionModule,
    WebsiteModule,
    HttpModule,
    AuthModule,
    ApplicationModule,
    InitializerModule,
    InstanceModule,
    DatabaseModule,
    StorageModule,
    LogModule,
    DependencyModule,
    TriggerModule,
    RegionModule,
    GatewayModule,
    PrismaModule,
    SubscriptionModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
