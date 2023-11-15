import { describe, expect, test } from '@jest/globals'
import { ClearTestUser, api } from '../api'
import * as crypto from 'crypto'
import { Config } from '../config'

describe('signin user with password', () => {
  const randomUsername = crypto.randomUUID()

  beforeAll(async () => {
    const res = await api.post('/v1/auth/passwd/signup', {
      username: randomUsername,
      password: Config.TEST_PASSWORD,
    })

    expect(res.status).toBe(201)
    expect(res.data?.data).toHaveProperty('token')
  })

  test('signin user with valid username & password should be ok', async () => {
    const res = await api.post('/v1/auth/passwd/signin', {
      username: randomUsername,
      password: Config.TEST_PASSWORD,
    })

    // console.log(res.data)
    // {
    //   error: null,
    //   data: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NGQxYjgyMWU0MzY1NzYzMjY3Nzc0YWUiLCJpYXQiOjE2OTE0NjU3NjEsImV4cCI6MTY5MjA3MDU2MX0.2HCv9R2MhwMNk4CDyvPquzd_hxkR6AQiYEfPu3Chs-Q'
    // }
    expect(res.status).toBe(201)
    expect(res.data?.error).toBeNull()
    const token = res.data?.data
    expect(token).not.toBeNull()

    // get user profile
    const res2 = await api.get('/v1/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // console.log(res2.data)
    // {
    //   error: null,
    //   data: {
    //     _id: '64d1bf33e4365763267774e7',
    //     username: '7fc0ffc6-1f4a-43ef-bd25-6e97148c6046',
    //     phone: null,
    //     email: null,
    //     profile: {
    //       _id: '64d1bf33e4365763267774e9',
    //       uid: '64d1bf33e4365763267774e7',
    //       name: '7fc0ffc6-1f4a-43ef-bd25-6e97148c6046',
    //     }
    //   }
    // }
    expect(res2.status).toBe(200)
    expect(res2.data?.error).toBeNull()

    const user = res2.data?.data
    expect(user).not.toBeNull()
    expect(user.profile).not.toBeNull()
    expect(user.username).toBe(randomUsername)
    expect(user.phone).toBeNull()
    expect(user.email).toBeNull()
    expect(user.profile.uid).toBe(user._id)
  })

  test('signin user with wrong password', async () => {
    const res = await api.post('/v1/auth/passwd/signin', {
      username: randomUsername,
      password: 'wrong-password',
    })

    // console.log(res.data)
    // { error: 'password incorrect', data: null }
    expect(res.status).toBe(201)
    expect(res.data?.error).toBe('password incorrect')
  })

  test('signin user with wrong username', async () => {
    const res = await api.post('/v1/auth/passwd/signin', {
      username: 'wrong-username',
      password: Config.TEST_PASSWORD,
    })

    // console.log(res.data)
    // { error: 'user not found', data: null }
    expect(res.status).toBe(201)
    expect(res.data?.error).toBe('user not found')
  })

  afterAll(async () => {
    await ClearTestUser(randomUsername)
  })
})
