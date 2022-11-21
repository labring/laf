import { Test, TestingModule } from '@nestjs/testing'
import { CoreModule } from '../core/core.module'
import { ApplicationsService } from './applications.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ApplicationState } from './entities/application.entity'

describe('AppsService', () => {
  let service: ApplicationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
      providers: [ApplicationsService],
    }).compile()

    service = module.get<ApplicationsService>(ApplicationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

describe('AppService create app', () => {
  const timeout = 60 * 1000
  let service: ApplicationsService
  let appid: string
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
      providers: [ApplicationsService],
    }).compile()

    service = module.get<ApplicationsService>(ApplicationsService)
  }, timeout)

  jest.setTimeout(timeout)

  async function cleanup() {
    if (!appid) return
    if (await service.k8sClient.existsNamespace(appid)) {
      await service.k8sClient.deleteNamespace(appid)
    }
    // wait for namespace deleted
    await new Promise((resolve) => setTimeout(resolve, 10000))
  }

  it('should create app', async () => {
    const dto = new CreateApplicationDto()
    dto.name = 'test-for-create-app'
    dto.state = ApplicationState.ApplicationStateRunning
    dto.region = 'default'
    dto.bundleName = 'mini'
    dto.runtimeName = 'node-laf'

    // create namespace
    appid = service.generateAppid(6)
    const ns = await service.createAppNamespace(appid)
    expect(ns).toBeDefined()
    expect(ns.kind).toEqual('Namespace')
    expect(ns.metadata.name).toEqual(appid)

    // create app
    const res = await service.create(appid, dto)
    expect(res).not.toBeNull()
    expect(res.kind).toBe('Application')
    expect(res.metadata.name).toBe(dto.name)
    expect(res.spec.state).toBe(ApplicationState.ApplicationStateRunning)
  })

  afterAll(async () => {
    await cleanup()
  }, 20000)
})
