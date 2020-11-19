<template>
  <div>
    <input v-model="id" type="text" />
    <input v-model="title" type="text" />
    <button @click="movie_regist">登録</button>

    <li v-for="(movie, key) in movies" :key="key">
      <a href="javascript:void(0)" @click="setid(movie.id, movie.title)">
        {{ movie.id }}
      </a>
      {{ movie.title }}
      <button @click="movie_delete(movie.id)">削除</button>
    </li>
    {{ ret }}
  </div>
</template>
<script>
export default {
  async asyncData({ $axios }) {
    const url = '/api/movies'
    const response = await $axios.$get(url)
    return {
      movies: response,
    }
  },
  data() {
    return {
      ret: '',
      title: '',
      movies: '',
      id: '',
    }
  },
  methods: {
    setid(id, title) {
      this.id = id
      this.title = title
    },
    async movie_list() {
      const url = '/api/movies'
      const response = await this.$axios.$get(url)
      return response
    },
    async movie_regist() {
      const url = '/api/movie_regist'
      const param = {
        id: this.id,
        title: this.title,
      }
      const response = await this.$axios.$post(url, param)
      this.ret = response.ret
      this.movies = await this.movie_list()
    },
    async movie_delete(id1) {
      const url = '/api/movie_delete'
      const param = {
        id: id1,
      }
      const response = await this.$axios.$post(url, param)
      this.ret = response.ret
      this.movies = await this.movie_list()
    },
  },
}
</script>
