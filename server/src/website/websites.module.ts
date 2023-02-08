import { Module } from '@nestjs/common'
import { WebsitesService } from './websites.service'
import { WebsitesController } from './websites.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
  controllers: [WebsitesController],
  providers: [WebsitesService, PrismaService],
})
export class WebsitesModule {}
