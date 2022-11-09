import { Injectable } from '@nestjs/common';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';

@Injectable()
export class WebsitesService {
  create(createWebsiteDto: CreateWebsiteDto) {
    return 'This action adds a new website';
  }

  findAll() {
    return `This action returns all websites`;
  }

  findOne(id: number) {
    return `This action returns a #${id} website`;
  }

  update(id: number, updateWebsiteDto: UpdateWebsiteDto) {
    return `This action updates a #${id} website`;
  }

  remove(id: number) {
    return `This action removes a #${id} website`;
  }
}
