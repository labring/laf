import { Test, TestingModule } from '@nestjs/testing'
import { ClusterService } from './cluster.service'

describe('ClusterService', () => {
  let service: ClusterService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClusterService],
    }).compile()

    service = module.get<ClusterService>(ClusterService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
