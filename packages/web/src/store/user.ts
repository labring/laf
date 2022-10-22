import { acceptHMRUpdate, defineStore } from 'pinia'
import { getToken, removeToken, setToken } from '~/utils/auth'
import * as userAPI from '~/api/user'
import { successMsg } from '~/utils/message'

export const useUserStore = defineStore('user', () => {
  let token = $ref(getToken())
  let tokenExpire = $ref(0)
  let userProfile = $ref<any>({})

  const login = async (username: string, password: string) => {
    const res = await userAPI.login({ username, password }) as any

    token = res.data.access_token
    tokenExpire = res.data.expire
    setToken(token, tokenExpire)
    return res
  }

  const getUserProfile = async () => {
    const { data } = await userAPI.getUserProfile()

    userProfile = data
    return data
  }

  const signup = async (data: any) => {
    const res = await userAPI.signup(data)

    successMsg('注册成功')
    return res
  }

  const edit = async (data: any) => {
    const res = await userAPI.edit(data)

    successMsg('修改成功')
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
