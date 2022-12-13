import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { WebsitesModule } from './websites/websites.module'
import { FunctionsModule } from './functions/functions.module'
import { HttpModule } from '@nestjs/axios'
import { CoreModule } from './core/core.module'
import { ApplicationsModule } from './applications/applications.module'
import { AuthModule } from './auth/auth.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { InitializerModule } from './initializer/initializer.module'
import { InstanceModule } from './instance/instance.module'
import { ScheduleModule } from '@nestjs/schedule'
import { DatabaseModule } from './database/database.module'
import { PrismaService } from './prisma.service'
import { StorageModule } from './storage/storage.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    FunctionsModule,
    WebsitesModule,
    HttpModule,
    AuthModule,
    CoreModule,
    ApplicationsModule,
    InitializerModule,
    InstanceModule,
    DatabaseModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
