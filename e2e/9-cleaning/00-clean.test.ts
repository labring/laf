import { describe, test } from '@jest/globals'
import { ClearTestApplications, ClearTestUser } from '../api'
import { Config } from '../config'

describe('cleaning', () => {
  test(
    'clear testing applications',
    async () => {
      await ClearTestApplications()
    },
    10 * 1000
  )

  test(
    'clear testing user',
    async () => {
      await ClearTestUser(Config.TEST_USERNAME)
    },
    10 * 1000
  )
})
