import { Module } from '@nestjs/common'
import { WebsiteService } from './website.service'
import { WebsiteController } from './website.controller'
import { ApplicationService } from 'src/application/application.service'

@Module({
  imports: [],
  controllers: [WebsiteController],
  providers: [WebsiteService, ApplicationService],
})
export class WebsiteModule {}
