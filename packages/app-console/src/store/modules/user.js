import { getUserProfile } from '@/api/user'
import { removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { openSystemClient } from '@/api'

const state = {
  user_profile: null
}

const mutations = {
  SET_USER_PROFILE: (state, user_profile) => {
    state.user_profile = user_profile
  }
}

const actions = {

  // get user info
  async getInfo({ commit, dispatch }) {
    const res = await getUserProfile()
    const { data } = res
    if (!data) {
      return dispatch('/user/logout')
    }
    const account = data
    commit('SET_USER_PROFILE', account)
    return data
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      removeToken()
      resetRouter()

      // reset visited views and cached views
      // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
      dispatch('tagsView/delAllViews', null, { root: true })
      dispatch('app/clearStates')

      openSystemClient()
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_USER_PROFILE', null)
      commit('SET_USER_PROFILE', null)
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
