import { describe, expect, test } from '@jest/globals'
import { api, EnsureTestToken } from '../api'
import { Config } from '../config'

describe('query monitor metrics normally', () => {
  const appid = Config.TEST_APPID
  let token = null
  beforeAll(async () => {
    token = await EnsureTestToken()
    expect(token).toBeTruthy()
  })

  test(
    'query monitor metrics range',
    async () => {
      const metrics = [
        'cpuUsage',
        'memoryUsage',
        'storageUsage',
        'databaseUsage',
      ]

      const query = {
        q: metrics,
        step: 300,
        type: 'range',
      }

      const res = await api.get(`/v1/monitor/${appid}/metrics`, {
        params: query,
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(res.status).toBe(200)

      const data = res.data?.data
      expect(Object.keys(data)).toEqual(expect.arrayContaining(metrics))

      Object.values(data).forEach((v: []) => {
        expect(Array.isArray(v)).toBeTruthy()
        v.forEach((item) => {
          expect([
            ['values', 'metric'],
            ['value', 'metric'],
          ]).toContainEqual(expect.arrayContaining(Object.keys(item)))
        })
      })
    },
    10 * 1000
  )

  test(
    'query monitor metrics instant',
    async () => {
      const metrics = [
        'cpuUsage',
        'memoryUsage',
        'storageUsage',
        'databaseUsage',
      ]

      const query = {
        q: metrics,
        step: 300,
        type: 'instant',
      }

      const res = await api.get(`/v1/monitor/${appid}/metrics`, {
        params: query,
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(res.status).toBe(200)

      const data = res.data?.data
      expect(Object.keys(data)).toEqual(expect.arrayContaining(metrics))

      Object.values(data).forEach((v: []) => {
        expect(Array.isArray(v)).toBeTruthy()

        expect([
          ['values', 'metric'],
          ['value', 'metric'],
        ]).toContainEqual(expect.arrayContaining(Object.keys(v)))
      })
    },
    10 * 1000
  )
})

describe('query monitor metrics with invalid inputs', () => {
  const appid = Config.TEST_APPID
  let token = null
  beforeAll(async () => {
    token = await EnsureTestToken()
    expect(token).toBeTruthy()
  })

  test(
    'query monitor metrics with invalid step',
    async () => {
      const metrics = [
        'cpuUsage',
        'memoryUsage',
        'storageUsage',
        'databaseUsage',
      ]

      const query = {
        q: metrics,
        step: 50,
      }

      const res = await api.get(`/v1/monitor/${appid}/metrics`, {
        params: query,
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(res.status).toBe(400)
    },
    10 * 1000
  )

  test(
    'query monitor metrics with invalid metrics',
    async () => {
      const metrics = ['cpuUsage', 'memoryUsage', 'storageUsage', 'invalid']

      const query = {
        q: metrics,
        step: 50,
      }

      const res = await api.get(`/v1/monitor/${appid}/metrics`, {
        params: query,
        headers: { Authorization: `Bearer ${token}` },
      })

      expect(res.status).toBe(400)
    },
    10 * 1000
  )
})
