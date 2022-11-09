import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BucketsService } from './buckets.service';
import { CreateBucketDto } from './dto/create-bucket.dto';
import { UpdateBucketDto } from './dto/update-bucket.dto';

@Controller('buckets')
export class BucketsController {
  constructor(private readonly bucketsService: BucketsService) {}

  @Post()
  create(@Body() createBucketDto: CreateBucketDto) {
    return this.bucketsService.create(createBucketDto);
  }

  @Get()
  findAll() {
    return this.bucketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bucketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBucketDto: UpdateBucketDto) {
    return this.bucketsService.update(+id, updateBucketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bucketsService.remove(+id);
  }
}
