<template>
  <div>
    <vue-json-to-csv :json-data="json_data" :labels="labels" :csv-title="csvtitle">
      <input type="button" ref="csvbtnclick" style="display:none;"/>
    </vue-json-to-csv>
  </div>
</template>
<script>
import Vue from 'vue'
import VueJsonToCsv from 'vue-json-to-csv' // eslint-disable-line

Vue.use(VueJsonToCsv)

export default {
  middleware: 'auth',
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
    csvdownload (url) {
      this.$axios.$post('/api/get_' + url)
        .then((response) => {
          this.csvtitle = response.csvtitle + '.csv'
          this.labels = response.labels
          this.json_data = response.data
        }).finally(() => {
          this.$refs.csvbtnclick.click()
        })
    }
  }
}
</script>
