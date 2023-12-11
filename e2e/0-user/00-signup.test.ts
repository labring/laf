import { describe, expect, test } from '@jest/globals'
import { ClearTestUser, api } from '../api'
import * as crypto from 'crypto'
import { Config } from '../config'

describe('signup user with password', () => {
  const randomUsername = crypto.randomUUID()

  test('signup user with valid username & password should be ok', async () => {
    const res = await api.post('/v1/auth/passwd/signup', {
      username: randomUsername,
      password: Config.TEST_PASSWORD,
    })

    expect(res.status).toBe(201)
    expect(res.data?.data).toHaveProperty('token')
  })

  test('signup user with same username', async () => {
    const res = await api.post('/v1/auth/passwd/signup', {
      username: randomUsername,
      password: Config.TEST_PASSWORD,
    })

    // Received value: {"data": null, "error": "user already exists"}
    expect(res.status).toBe(201)
    expect(res.data?.error).toBe('user already exists')
  })

  test('signup user with short password', async () => {
    const res = await api.post('/v1/auth/passwd/signup', {
      username: randomUsername,
      password: '123',
    })

    // console.log(res.data)
    // {
    //   message: [ 'password must be longer than or equal to 8 characters' ],
    //   error: 'Bad Request'
    // }
    expect(res.status).toBe(400)
    expect(res.data?.message).toContain(
      'password must be longer than or equal to 8 characters'
    )
  })

  afterAll(async () => {
    await ClearTestUser(randomUsername)
  })
})
