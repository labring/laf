import { describe, expect, test } from '@jest/globals'
import { api, EnsureTestToken, GetRegion, GetRuntime } from '../api'
import * as crypto from 'crypto'
import { Config } from '../config'

describe('create testing application normally', () => {
  const appName = Config.TEST_APP_NAME
  let appid = null
  let token = null
  beforeAll(async () => {
    token = await EnsureTestToken()
    expect(token).toBeTruthy()
  })

  test(
    'create testing application should be ok',
    async () => {
      const region = await GetRegion()
      const runtime = await GetRuntime()

      const data = {
        cpu: 200,
        memory: 256,
        databaseCapacity: 1024,
        storageCapacity: 2048,
        autoscaling: {
          enable: false,
          minReplicas: 1,
          maxReplicas: 5,
          targetCPUUtilizationPercentage: 50,
          targetMemoryUtilizationPercentage: 50,
        },
        name: appName,
        state: 'Running',
        regionId: region._id.toString(),
        runtimeId: runtime._id.toString(),
      }

      const res = await api.post('/v1/applications', data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(res.status).toBe(201)

      const application = res.data?.data
      expect(application).toBeTruthy()
      expect(application.name).toBe(data.name)
      expect(application.state).toBe(data.state)
      expect(application.regionId).toBe(data.regionId)
      expect(application.runtimeId).toBe(data.runtimeId)
      expect(application.appid).toBeTruthy()

      const bundle = application.bundle
      expect(bundle).toBeTruthy()
      expect(bundle.appid).toBe(application.appid)

      const resource = bundle.resource
      expect(resource).toBeTruthy()
      expect(resource.limitCPU).toBe(data.cpu)
      expect(resource.limitMemory).toBe(data.memory)
      expect(resource.databaseCapacity).toBe(data.databaseCapacity)
      expect(resource.storageCapacity).toBe(data.storageCapacity)

      expect(bundle.autoscaling).toEqual(data.autoscaling)

      const configuration = application.configuration
      expect(configuration).toBeTruthy()
      expect(configuration.appid).toBe(application.appid)

      const environments: any[] = configuration.environments || []
      expect(environments.length).toBe(1)

      appid = application.appid
    },
    10 * 1000
  )

  test(
    'wait for application phase to be Started',
    async () => {
      let app = null
      for (let i = 0; i < 20; i++) {
        const res2 = await api.get(`/v1/applications/${appid}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        app = res2.data?.data
        if (app.phase === 'Started') {
          break
        }
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }

      expect(app.phase).toBe('Started')
    },
    100 * 1000
  )
})

describe('create testing application with invalid inputs', () => {
  const randomName = 'testing-' + crypto.randomUUID()
  const appid = null
  let token = null
  beforeAll(async () => {
    token = await EnsureTestToken()
    expect(token).toBeTruthy()
  })

  test.skip('create testing application with invalid cpu should be failed', async () => {
    const region = await GetRegion()
    const runtime = await GetRuntime()

    const data = {
      cpu: 0,
      memory: 256,
      databaseCapacity: 1024,
      storageCapacity: 2048,
      autoscaling: {
        enable: false,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilizationPercentage: 50,
        targetMemoryUtilizationPercentage: 50,
      },
      name: randomName,
      state: 'Running',
      regionId: region._id.toString(),
      runtimeId: runtime._id.toString(),
    }

    const res = await api.post('/v1/applications', data, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log(res.data)
    expect(res.status).toBe(400)
    expect(res.data?.message).toBe('invalid cpu')
  })

  test.skip('create testing application with invalid memory should be failed', async () => {
    const region = await GetRegion()
    const runtime = await GetRuntime()

    const data = {
      cpu: 200,
      memory: 0,
      databaseCapacity: 1024,
      storageCapacity: 2048,
      autoscaling: {
        enable: false,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilizationPercentage: 50,
        targetMemoryUtilizationPercentage: 50,
      },
      name: randomName,
      state: 'Running',
      regionId: region._id.toString(),
      runtimeId: runtime._id.toString(),
    }

    const res = await api.post('/v1/applications', data, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log(res.data)
    expect(res.status).toBe(400)
    expect(res.data?.message).toBe('invalid memory')
  })

  test.skip('create testing application with invalid databaseCapacity should be failed', async () => {
    const region = await GetRegion()
    const runtime = await GetRuntime()

    const data = {
      cpu: 200,
      memory: 256,
      databaseCapacity: 0,
      storageCapacity: 2048,
      autoscaling: {
        enable: false,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilizationPercentage: 50,
        targetMemoryUtilizationPercentage: 50,
      },
      name: randomName,
      state: 'Running',
      regionId: region._id.toString(),
      runtimeId: runtime._id.toString(),
    }

    const res = await api.post('/v1/applications', data, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log(res.data)
    expect(res.status).toBe(400)
    expect(res.data?.message).toBe('invalid databaseCapacity')
  })

  test.skip('create testing application with invalid storageCapacity should be failed', async () => {
    const region = await GetRegion()
    const runtime = await GetRuntime()

    const data = {
      cpu: 200,
      memory: 256,
      databaseCapacity: 1024,
      storageCapacity: 0,
      autoscaling: {
        enable: false,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilizationPercentage: 50,
        targetMemoryUtilizationPercentage: 50,
      },
      name: randomName,
      state: 'Running',
      regionId: region._id.toString(),
      runtimeId: runtime._id.toString(),
    }

    const res = await api.post('/v1/applications', data, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log(res.data)
    expect(res.status).toBe(400)
    expect(res.data?.message).toBe('invalid storageCapacity')
  })

  test('create testing application with invalid state should be failed', async () => {
    const region = await GetRegion()
    const runtime = await GetRuntime()

    const data = {
      cpu: 200,
      memory: 256,
      databaseCapacity: 1024,
      storageCapacity: 2048,
      autoscaling: {
        enable: false,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilizationPercentage: 50,
        targetMemoryUtilizationPercentage: 50,
      },
      name: randomName,
      state: 'Stopped',
      regionId: region._id.toString(),
      runtimeId: runtime._id.toString(),
    }

    const res = await api.post('/v1/applications', data, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // console.log(res.data)
    // {
    //   statusCode: 400,
    //   message: [ 'state must be one of the following values: Running' ],
    //   error: 'Bad Request'
    // }
    expect(res.status).toBe(400)
    expect(res.data?.message).toContain(
      'state must be one of the following values: Running'
    )
  })

  test('create testing application with invalid regionId should be failed', async () => {
    const runtime = await GetRuntime()

    const data = {
      cpu: 200,
      memory: 256,
      databaseCapacity: 1024,
      storageCapacity: 2048,
      autoscaling: {
        enable: false,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilizationPercentage: 50,
        targetMemoryUtilizationPercentage: 50,
      },
      name: randomName,
      state: 'Running',
      regionId: runtime._id.toString(), // use runtime id as the wrong region id
      runtimeId: runtime._id.toString(),
    }

    const res = await api.post('/v1/applications', data, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // console.log(res.data)
    // { error: 'region 64d1e43b2f3799b5ea629c5d not found', data: null }
    expect(res.status).toBe(201)
    expect(res.data?.error).toContain('region')
    expect(res.data?.error).toContain('not found')
  })

  test('create testing application with invalid runtimeId should be failed', async () => {
    const region = await GetRegion()
    // const runtime = await GetRuntime()

    const data = {
      cpu: 200,
      memory: 256,
      databaseCapacity: 1024,
      storageCapacity: 2048,
      autoscaling: {
        enable: false,
        minReplicas: 1,
        maxReplicas: 5,
        targetCPUUtilizationPercentage: 50,
        targetMemoryUtilizationPercentage: 50,
      },
      name: randomName,
      state: 'Running',
      regionId: region._id.toString(),
      runtimeId: region._id.toString(), // use region id as the wrong runtime id
    }

    const res = await api.post('/v1/applications', data, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // console.log(res.data)
    expect(res.status).toBe(201)
    expect(res.data?.error).toContain('runtime')
    expect(res.data?.error).toContain('not found')
  })
})
