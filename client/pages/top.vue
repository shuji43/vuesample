<template>
  <div id="main">
    <h2>トップメニュー</h2>
    <div align="center">
      <div id="main">
        <div class="news">
          <span class="blue">お知らせ</span>
          <p style="white-space: pre;" v-text="oshirase" />
        </div>
      </div>
      <a href="/password"><button class="btn">パスワードの変更</button></a>
    </div>
  </div>
    <!--
    <p>
      <img :src="avatar" hight="120" width="120" />
    </p>
    <p>名前 : {{ this.$auth.$state.user.name }}</p>
    <br />
    <p>メールアドレス : {{ this.$auth.$state.user.email }}</p>
    aaa[{{ $store.state.aaa }}]
    <button @click="logoutNow">
      ログアウト
    </button>
    <li v-for="(movie, key) in movies" :key="key">
      {{ movie.ID }}
      {{ movie.単位 }}
    </li>
-->
</template>
<script>
export default {
  middleware: 'auth',
  async asyncData ({ $axios }) {
    const url = '/api/get_oshirase'
    const response = await $axios.$get(url)
    return {
      oshirase: response.comment
    }
  },
/*
  methods: {
    logoutNow() {
      this.$auth.logout()
    },
  },
*/
}
</script>
