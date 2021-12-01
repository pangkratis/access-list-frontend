export const userModule = {
  namespaced: true,
  state: () => {
    return {
      userData: []
    }
  },
  getters: {
    getUser: state => {
      return state.userData
    }
  },
  mutations: {
    SET_USER (state, payload) {
      state.userData = payload
    }
  }
}
