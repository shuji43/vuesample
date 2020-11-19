<template>
  <div>
    <h1>sample</h1>
    <div id="app-2">
      <h2>[{{ info }}]</h2>
      <input v-model="message" type="text" />
      <div v-if="error.require" class="error">必須項目です。</div>
      <div v-if="error.tooLong" class="error">長すぎます。</div>
      <div v-if="error.tooShort" class="error">短すぎます。</div>
    </div>
    <div id="app-101">
      <h2>app-101</h2>
      <!-- この行と -->
      <div v-text="message"></div>
      <!-- この行は、同じ意味を持ちます -->
      <div>{{ message }}</div>
    </div>
    <div id="app-102">
      <h2>app-102</h2>
      <!-- 置換される -->
      <div v-text="message"></div>
      <!-- 置換されない -->
      <div v-html="message"></div>
    </div>
    <div id="app-103">
      <h2>app-103</h2>
      <input type="checkbox" checked @click="change" />
      <span v-show="seen">v-show Hello!</span>
      <span v-if="seen">v-if Hello!</span>
      <span v-else>Bye!</span>
    </div>
    <div id="app-106">
      <h2>app-106</h2>
      <input
        type="radio"
        name="app106-type"
        @click="app106_typeset('A')"
        checked
      />
      <input type="radio" name="app106-type" @click="app106_typeset('B')" />
      <input type="radio" name="app106-type" @click="app106_typeset('C')" />
      <span v-if="app106.type == 'A'">Good morning.</span>
      <span v-else-if="app106.type == 'B'">Hello!</span>
      <span v-else>Bye!</span>
      {{ app106.type }}
    </div>
  </div>
</template>
<style>
#app-2 .error {
  color: red;
}
</style>
<script>
export default {
  data() {
    return {
      app106: {
        type: 'A',
      },
      seen: true,
      message: 'Hello',
      info: 'app-2',
      error: {
        require: false,
        tooLong: false,
        tooShort: false,
      },
    }
  },
  watch: {
    message(newVal, oldVal) {
      this.error.require = newVal.length < 1
      this.error.tooLong = newVal.length > 5
      this.error.tooShort = newVal.length < 3 && newVal.length >= 1
    },
  },
  methods: {
    change(e) {
      this.seen = e.target.checked
    },
    app106_typeset(intype) {
      this.app106.type = intype
    },
  },
}
</script>
