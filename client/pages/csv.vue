<template>
  <div>
    <div>hoge1234</div>
    <vue-json-to-csv :json-data=json_data :labels=labels :csv-title="csvtitle">
      <button @click=download>
        <b>My custom button</b>
      </button>
    </vue-json-to-csv>
  </div>
</template>

<script>
import Vue from 'vue'
import VueJsonToCsv from 'vue-json-to-csv' // eslint-disable-line

Vue.use(VueJsonToCsv)

export default {
  name: 'CsvDownload',
  components: {
    VueJsonToCsv
  },
  data () {
    return {
      labels: {},
      json_data: [],
      csvtitle: ''
    }
  },
  methods: {
    download () {
      this.csvtitle = 'kantoku'
      this.labels = {
        gyoshaCd: { title: '業者CD' },
        gyoshaName: { title: '業者正式名' },
        gyoshaShortName: { title: '業者略名' },
        gyoshaKana: { title: '業者ｶﾅ名' }
      }

      this.$axios.$post('/api/get_gyosha_json')
        .then((response) => {
          for (let i = 0; response.length > i; i++) {
            const j = response[i]
            console.log(j)
            this.json_data.push({ gyoshaCd: j.業者CD, gyoshaName: j.業者正式名, gyoshaShortName: j.業者略名, gyoshaKana: j.業者ｶﾅ名 })
          }
        })
      //
      /*
      this.json_data = [
        { gyoshaCd: '1111', gyoshaName: '山田一郎', gyoshaShortName: '山田', gyoshaKana: 'ﾔﾏﾀﾞ' },
        { gyoshaCd: '2222', gyoshaName: '田中痔瘻', gyoshaShortName: '田中', gyoshaKana: 'ﾀﾅｶ' }
      ]
      this.json_data.push({ gyoshaCd: '3333', gyoshaName: '佐藤玲子', gyoshaShortName: '佐藤', gyoshaKana: 'ｻﾄｳ' })
      */
    }
  },
  mounted() {
    this.download()
  }
}
</script>
