
export default {
  nuxtServerInit ({ commit }, { req }) {
    if (req.cookies) {
      console.log('nuxtServerInit', req.csrfToken())
      commit('SET_CSRF_TOKEN', req.csrfToken())
    }
  }
}
