import { Module } from '@nestjs/common'
import { WebsiteService } from './website.service'
import { WebsiteController } from './website.controller'
import { ApplicationService } from 'src/application/application.service'
import { StorageModule } from 'src/storage/storage.module'

@Module({
  imports: [StorageModule],
  controllers: [WebsiteController],
  providers: [WebsiteService, ApplicationService],
})
export class WebsiteModule {}
