import { Test, TestingModule } from '@nestjs/testing'
import { InitializerService } from './initializer.service'

describe('InitializerService', () => {
  let service: InitializerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitializerService],
    }).compile()

    service = module.get<InitializerService>(InitializerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
