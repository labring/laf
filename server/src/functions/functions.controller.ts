import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { CreateFunctionDto } from './dto/create-function.dto';
import { UpdateFunctionDto } from './dto/update-function.dto';

@Controller('functions')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}

  @Post()
  create(@Body() createFunctionDto: CreateFunctionDto) {
    return this.functionsService.create(createFunctionDto);
  }

  @Get()
  findAll() {
    return this.functionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.functionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFunctionDto: UpdateFunctionDto) {
    return this.functionsService.update(+id, updateFunctionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.functionsService.remove(+id);
  }
}
