import { Test, TestingModule } from '@nestjs/testing';
import { BundlesService } from './bundles.service';

describe('BundlesService', () => {
  let service: BundlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BundlesService],
    }).compile();

    service = module.get<BundlesService>(BundlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
