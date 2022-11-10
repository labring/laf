import { Module } from '@nestjs/common';
import { WebsitesService } from './websites.service';
import { WebsitesController } from './websites.controller';

@Module({
  controllers: [WebsitesController],
  providers: [WebsitesService]
})
export class WebsitesModule {}
