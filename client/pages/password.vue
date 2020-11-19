<template>
  <div align="center" id="login">
    <div class="bluebox">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <th height="20" nowrap><b>現在のパスワード</b></th>
          <td><input type="password" v-model="nowpassword" maxlength="8"></td>
        </tr>
        <tr>
          <th height="20" nowrap><b>新しいパスワード</b></th>
          <td><input type="password" v-model="password1" maxlength="8"></td>
        </tr>
        <tr>
          <th height="20" nowrap><b>確認のためもう一度入力下さい</b></th>
          <td><input type="password" v-model="password2"  maxlength="8"></td>
        </tr>
      </table>
    </div>
    <div align="center">
      <pre class="error">{{ ERROR_MESSAGE }}</pre>
    </div>
    <div class="henko">
      <div class="blue">
        ※パスワードの設定に際して
      </div>
      パスワードは以下のルールに従って設定してください。<BR />
      （１） 文字数は8桁（<b style="color:red">半角英字、数字、記号（ ! @ # $ % のうち一文字以上）を全て混在させてください。　　例：@Z0808r#</b>） &#13;<br>
      （２） ＩＤとＰＡＳＳは同じ文言は不可<BR />
      （３） 同じ文字の    連続は不可<BR />
    </div>
    <div align="center">
      <input type="button" class="btn" value="パスワード更新" @click="passwordUpdate" />
    </div>
    <BR />
    <div class="henko">
      <div class="blue">※通知用メールアドレスのチェック</div>
      こちらのメールアドレスに、メールが送信されているかご確認ください。
    </div>
    <div align="center">
      <input type="button" class="btn" value="メール送信" @click="mailCheck" />
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      ERROR_MESSAGE: ''
    }
  },
  methods: {
    async passwordUpdate () {
      const params = {
        nowpassword: this.nowpassword,
        password1: this.password1,
        password2: this.password2
      }
      const response = await this.$axios.$post('/api/password_update', params)
      this.ERROR_MESSAGE = response.ret
    },
    async mailCheck () {
      const response = await this.$axios.$post('/api/mail_check')
      this.ERROR_MESSAGE = response.ret
    }

  }
}
</script>
