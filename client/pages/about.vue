<template>
  <div>
    <h1>{{ title }}</h1>
    <h2>{{ subtitle }}</h2>
  </div>
</template>

<script>
export default {
  auth: false,
  data() {
    return {
      title: 'About Page',
      subtitle: 'この文書はNuxt.jsの基本的な使用方法について説明しています。',
    }
  },
}
</script>
