import axios from 'axios'
import { Config } from './config'
import { getDbClient } from './system-db'

export const api = axios.create({
  baseURL: Config.API_ENDPOINT,
  validateStatus: (status) => {
    return status >= 200 && status <= 430
  },
})

export async function EnsureTestToken() {
  const res = await api.post('/v1/auth/passwd/signin', {
    username: Config.TEST_USERNAME,
    password: Config.TEST_PASSWORD,
  })

  const token: string = res.data?.data
  if (token) {
    return token
  }

  const res2 = await api.post('/v1/auth/passwd/signup', {
    username: Config.TEST_USERNAME,
    password: Config.TEST_PASSWORD,
  })

  const token2: string = res2.data?.data?.token
  return token2
}

export async function GetTestApplication() {
  const client = await getDbClient()
  const db = client.db()
  try {
    const user = await db
      .collection('User')
      .findOne({ username: Config.TEST_USERNAME })
    const app = await db.collection('Application').findOne({
      createdBy: user._id,
      state: 'Running',
      phase: 'Started',
      name: Config.TEST_APP_NAME,
    })
    return app
  } finally {
    await client.close()
  }
}

export async function ClearTestApplications() {
  const client = await getDbClient()
  const db = client.db()
  const user = await db
    .collection('User')
    .findOne({ username: Config.TEST_USERNAME })

  try {
    if (!user) return
    await db
      .collection('Application')
      .updateMany({ createdBy: user._id }, { $set: { state: 'Deleted' } })
  } finally {
    await client.close()
  }
}

export async function ClearTestUser(username: string) {
  const client = await getDbClient()
  const db = client.db()
  try {
    const user = await db.collection('User').findOne({ username: username })
    if (!user) return
    await db.collection('UserPassword').deleteMany({ uid: user._id })
    await db.collection('UserProfile').deleteOne({ uid: user._id })
    await db.collection('Account').deleteOne({ createdBy: user._id })
    await db.collection('User').deleteOne({ _id: user._id })
  } finally {
    await client.close()
  }
}

export async function GetRegion() {
  const client = await getDbClient()
  const db = client.db()
  try {
    const region = await db.collection('Region').findOne()
    return region
  } finally {
    await client.close()
  }
}

export async function GetRuntime() {
  const client = await getDbClient()
  const db = client.db()
  try {
    const runtime = await db.collection('Runtime').findOne()
    return runtime
  } finally {
    await client.close()
  }
}
