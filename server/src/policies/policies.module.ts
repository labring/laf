import { Module } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';

@Module({
  controllers: [PoliciesController],
  providers: [PoliciesService]
})
export class PoliciesModule {}
