import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

describe('CollectionsController', () => {
  let controller: CollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [CollectionsService],
    }).compile();

    controller = module.get<CollectionsController>(CollectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
