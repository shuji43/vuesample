<template>
  <div>
    <div id="header">
      <Csvdownload ref="Csvdownload" />
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td background="/img/bg_top.gif">
            <img src="/img/header.gif" width="493" height="61">
          </td>
          <td v-if="$auth.loggedIn" width="450" align="right" background="img/bg_top.gif">
            <input type="image" src="img/gyousha.gif" v-on:click="csvdownload('gyousha')" />
            <input type="image" src="img/kantoku.gif" v-on:click="csvdownload('kantoku')" />
            <input type="image" src="img/saimoku.gif" v-on:click="csvdownload('saimoku')" />
            <nuxt-link to="/top"><input type="image" src="img/home.gif" ></nuxt-link>
            <a href="#" @click="logoutNow"><input type="image" src="img/logout.gif" ></a>
          </td>
        </tr>
      </table>
      <NavBar />
      <div v-if="$auth.loggedIn" class="name2">
        <table width="100%" height="24" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <th>{{ this.$auth.$state.user.name }}様専用ページ</th>
          </tr>
        </table>
      </div>
    </div>

    <div id="main" style="position:relative;text-align:center;">
      <Nuxt />
    </div>
    <div id="footer">
      <br>
      <table width="100%" height="18" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td align="right" valign="middle" bgcolor="#0059A9">
            Copyright (C) 2020 ZERO CORPORATION Co.,Ltd. All rights reserved.
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
export default {
  middleware: 'auth',
  methods: {
    logoutNow () {
      this.$auth.logout()
    },
    csvdownload (name) {
      this.$refs.Csvdownload.csvdownload(name)
    }
  }
}
</script>
