import { Test, TestingModule } from '@nestjs/testing';
import { BucketsService } from './buckets.service';

describe('BucketsService', () => {
  let service: BucketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BucketsService],
    }).compile();

    service = module.get<BucketsService>(BucketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
