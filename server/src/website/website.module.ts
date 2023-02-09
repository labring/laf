import { Module } from '@nestjs/common'
import { WebsiteService } from './website.service'
import { WebsiteController } from './website.controller'
import { PrismaService } from 'src/prisma.service'
import { RegionModule } from 'src/region/region.module'
import { ApplicationService } from 'src/application/application.service'

@Module({
  imports: [RegionModule],
  controllers: [WebsiteController],
  providers: [WebsiteService, PrismaService, ApplicationService],
})
export class WebsiteModule {}
