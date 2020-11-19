export default {
  SET_CSRF_TOKEN (state, csrfToken) {
    console.log('mutations', csrfToken)
    state.csrfToken = csrfToken
  }
}
