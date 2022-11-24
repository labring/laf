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

const userid = 'test-user-id'

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
    appid = service.generateAppid(6)
    const dto = new CreateApplicationDto()
    dto.name = appid
    dto.state = ApplicationState.ApplicationStateRunning
    dto.region = 'default'
    dto.bundleName = 'mini'
    dto.runtimeName = 'node-laf'

    // create namespace
    const ns = await service.createAppNamespace(appid, userid)
    expect(ns).toBeDefined()
    expect(ns.kind).toEqual('Namespace')
    expect(ns.metadata.name).toEqual(appid)

    // create app
    const res = await service.create(userid, appid, dto)
    expect(res).not.toBeNull()
    expect(res.kind).toBe('Application')
    expect(res.metadata.name).toBe(dto.name)
    expect(res.spec.state).toBe(ApplicationState.ApplicationStateRunning)
  })

  afterAll(async () => {
    await cleanup()
  }, 20000)
})

describe.skip('AppService find app by appid', () => {
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

  it('should find app by appid', async () => {
    appid = '1i43zq'
    const res = await service.findOne(appid)
    expect(res).not.toBeNull()
    expect(res.kind).toBe('Application')
    expect(res.metadata.name).toBe(appid)
    console.log(res)
  })
})
