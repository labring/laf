import { describe, expect, test } from '@jest/globals'
import { api, ClearTestApplications, ClearTestUser } from '../api'
import { Config } from '../config'

describe('cleaning', () => {
  test('clear testing applications', async () => {
    await ClearTestApplications()
  }, 10 * 1000)
})
