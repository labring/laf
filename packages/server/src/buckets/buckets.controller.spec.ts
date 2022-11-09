import { Test, TestingModule } from '@nestjs/testing';
import { BucketsController } from './buckets.controller';
import { BucketsService } from './buckets.service';

describe('BucketsController', () => {
  let controller: BucketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BucketsController],
      providers: [BucketsService],
    }).compile();

    controller = module.get<BucketsController>(BucketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
