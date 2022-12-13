import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { PolicyService } from './policy.service'
import { CreatePolicyDto } from './dto/create-policy.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { UpdatePolicyDto } from './dto/update-policy.dto'

@ApiTags('Database')
@ApiBearerAuth('Authorization')
@Controller('apps/:appid/policies')
export class PolicyController {
  constructor(private readonly policiesService: PolicyService) {}

  @Post()
  @ApiOperation({ summary: 'TODO - ⌛️' })
  create(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policiesService.create(createPolicyDto)
  }

  @Get()
  @ApiOperation({ summary: 'TODO - ⌛️' })
  findAll() {
    return this.policiesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'TODO - ⌛️' })
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(+id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'TODO - ⌛️' })
  update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto) {
    return this.policiesService.update(+id, updatePolicyDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'TODO - ⌛️' })
  remove(@Param('id') id: string) {
    return this.policiesService.remove(+id)
  }
}
