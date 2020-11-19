<template>
  <div>
    <nuxt-link v-if="$auth.loggedIn" to="/gmo">gmo</nuxt-link>
    <!--
    <nuxt-link to="/about">About</nuxt-link>
    <a v-if="$auth.loggedIn" href="#" @click="logoutNow">logout</a>
    <a v-else href="/login">login</a>
    -->
  </div>
</template>
<script>
export default {
  middleware: 'auth',
  data () {
    return {
      /*
      avatar: this.$auth.$state.user.picture,
*/
    }
  },
  methods: {
    logoutNow() {
      this.$auth.logout()
    }
  }
}
</script>
