import { acceptHMRUpdate, defineStore } from 'pinia'
import { getToken, removeToken, setToken } from '~/utils/auth'
import * as userAPI from '~/api/user'

export const useUserStore = defineStore('user', () => {
  let token = $ref(getToken())
  let tokenExpire = $ref(0)
  let userProfile = $ref<any>({})

  const login = async (username: string, password: string) => {
    const res = await userAPI.login({ username, password }) as any
    if (res.error) {
      ElMessage({
        message: res.error,
        type: 'error',
      })
      return
    }
    token = res.data.access_token
    tokenExpire = res.data.expire
    setToken(token, tokenExpire)
    return res
  }

  const getUserProfile = async () => {
    const { data, error } = await userAPI.getUserProfile()
    if (error) {
      ElMessage({
        message: error,
        type: 'error',
      })
      return
    }
    userProfile = data
    return data
  }

  const signup = async (data: any) => {
    const res = await userAPI.signup(data)
    if (res.error) {
      ElMessage({
        message: res.error,
        type: 'error',
      })
      return
    }
    ElMessage({
      message: '注册成功',
      type: 'success',
    })
    return res
  }

  const edit = async (data) => {
    const res = await userAPI.edit(data)
    if (res.error) {
      ElMessage({
        message: res.error,
        type: 'error',
      })
      return
    }
    ElMessage({
      message: '修改成功',
      type: 'success',
    })
    return res
  }

  const logOut = async () => {
    token = ''
    tokenExpire = 0
    userProfile = {}
    removeToken()
  }

  return {
    token: $$(token),
    tokenExpire: $$(tokenExpire),
    userProfile: $$(userProfile),
    login,
    getUserProfile,
    signup,
    edit,
    logOut,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
