import { Test, TestingModule } from '@nestjs/testing'
import { CoreModule } from '../core/core.module'
import { AppsService } from './apps.service'

describe('AppsService', () => {
  let service: AppsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
      providers: [AppsService],
    }).compile()

    service = module.get<AppsService>(AppsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
