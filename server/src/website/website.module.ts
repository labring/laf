import { Module } from '@nestjs/common'
import { WebsiteService } from './website.service'
import { WebsiteController } from './website.controller'
import { RegionModule } from 'src/region/region.module'
import { ApplicationService } from 'src/application/application.service'

@Module({
  imports: [RegionModule],
  controllers: [WebsiteController],
  providers: [WebsiteService, ApplicationService],
})
export class WebsiteModule {}
