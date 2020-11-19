/*

export const state = () => ({
  aaa: 'bbb'
})

export const actions = {
  nuxtServerInit ({ commit }, { req }) {
    if (req.cookies) {
      commit('SET_CSRF_TOKEN', req.csrfToken())
    }
  }
}

export const getters = () => ({
  csrfToken: (state) => {
    state.aaa = 'cccc'
    console.log('#3', state.aaa)
    return state.aaa
  }
})

*/
export default () => ({
  csrfToken: ''
})
