<template>
  <div id="login">
    <h2><img src="/img/rogo.jpg" width="110" height="24"></h2>
    <form @submit.prevent="loginUser">
      <table width="100%" height="120" border="0" cellpadding="4" cellspacing="2">
        <tr bgcolor="#EBEEF4">
          <td width="30%" class="bold">監督CD</td>
          <td width="77%">
            <input v-model="user.loginid" tabindex="1" style="width:100px;ime-mode:inactive" autocomplete="off" />
          </td>
        </tr>
        <tr bgcolor="#EBEEF4" class="bold">
          <td width="30%">PASSWORD</td>
          <td width="77%">
            <input v-model="user.password" type="password" tabindex="2" style="width:100px;" />
          </td>
        </tr>
        <tr>
          <td colspan="2" align="center">
            <input type="submit" value="　　ログイン　　" />
            <div v-show="error" class="error">ユーザー名かパスワードが異なります。</div>
          </td>
        </tr>
      </table>
      <img src="/img/text.jpg" width="457" height="115" alt="ご注意点">
    </form>
  </div>
</template>
<script>
export default {
/*
  middleware ({ store, redirect }) {
    if (store.$auth.loggedIn) {
      redirect('/')
    }
  },
*/
  data () {
    return {
      user: {
        loginid: '',
        password: ''
      },
      error: false
    }
  },
  methods: {
    async loginUser () {
      this.error = false
      try {
        await this.$auth.loginWith('local', {
          data: this.user
        })
        /* 任意のタイミングでリダイレクト
        this.$router.replace({ path: '/profile' })
*/
      } catch (error) {
        this.error = true
      }
    }
  }
}
</script>
