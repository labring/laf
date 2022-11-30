import { Test, TestingModule } from '@nestjs/testing';
import { SpecsController } from './specs.controller';

describe('SpecsController', () => {
  let controller: SpecsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecsController],
    }).compile();

    controller = module.get<SpecsController>(SpecsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
