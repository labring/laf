import { Test, TestingModule } from '@nestjs/testing'
import { RuntimesService } from './runtimes.service'

describe('RuntimeService', () => {
  let service: RuntimesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuntimesService],
    }).compile()

    service = module.get<RuntimesService>(RuntimesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
