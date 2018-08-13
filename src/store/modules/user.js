import { getToken, setToken, removeToken } from '@/utils/auth'
import { contracts, web3 } from '@/lib/eth'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 登录
    async Login({ commit }) {
      const username = web3.toUtf8(await contracts.userInfo.nameOf(web3.eth.defaultAccount))
      if (username) {
        setToken(web3.eth.defaultAccount)
        commit('SET_TOKEN', web3.eth.defaultAccount)
        commit('SET_NAME', username)
      }
    },

    // 获取用户信息
    async GetInfo({ commit, state }) {
      const userAddress = state.token
      const coo = await contracts.coinCowCore.cooAddress()
      const roles = ['user']
      if (userAddress === coo) {
        roles.push('coo')
      }
      commit('SET_ROLES', roles)
      const user = {
        roles
      }
      return user
    },

    // 登出
    LogOut({ commit, state }) {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
