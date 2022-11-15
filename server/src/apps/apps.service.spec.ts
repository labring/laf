import { Test, TestingModule } from '@nestjs/testing'
import { CoreModule } from '../core/core.module'
import { AppsService } from './apps.service'
import { CreateAppDto } from './dto/create-app.dto'
import { ApplicationState } from './entities/app.entity'

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

describe.only('AppService create app', () => {
  const timeout = 60 * 1000
  let service: AppsService
  const name = 'testing-create-app'
  async function cleanup() {
    if (await service.k8sClient.existsNamespace(name)) {
      await service.k8sClient.deleteNamespace(name)
    }
    // wait for namespace deleted
    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
      providers: [AppsService],
    }).compile()

    service = module.get<AppsService>(AppsService)

    await cleanup()
  }, timeout)

  jest.setTimeout(timeout)

  it('should create app', async () => {
    const dto = new CreateAppDto()
    dto.name = name
    dto.state = ApplicationState.ApplicationStateRunning
    dto.region = 'default'
    dto.bundleName = 'mini'
    dto.runtimeName = 'node-laf'
    try {
      const res = await service.create(dto)
      expect(res.error).toBeNull()
      expect(res.data).toBe('create app success')
    } catch (err) {
      console.log(err.response)
      throw err
    }
  })

  afterAll(async () => {
    // await cleanup()
  }, 20000)
})
