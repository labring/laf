import { Injectable } from '@nestjs/common';
import { CreateFunctionDto } from './dto/create-function.dto';
import { UpdateFunctionDto } from './dto/update-function.dto';

@Injectable()
export class FunctionsService {
  create(createFunctionDto: CreateFunctionDto) {
    return 'This action adds a new function';
  }

  findAll() {
    return `This action returns all functions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} function`;
  }

  update(id: number, updateFunctionDto: UpdateFunctionDto) {
    return `This action updates a #${id} function`;
  }

  remove(id: number) {
    return `This action removes a #${id} function`;
  }
}
