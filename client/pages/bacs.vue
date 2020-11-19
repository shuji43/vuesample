<template>
  <div>
    {{ ret }}
    <button @click="update">
      BACS送信
    </button>
    <button @click="list">
      画面更新
    </button>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              案件No
            </th>
            <th class="text-left">
              建物コード
            </th>
            <th class="text-left">
              部屋番号
            </th>
            <th class="text-left">
              入居者名
            </th>
            <th class="text-left">
              棟番号
            </th>
            <th class="text-left">
              案件名
            </th>
            <th class="text-left">
              受付日時
            </th>
            <th class="text-left">
              案件対応部課CD
            </th>
            <th class="text-left">
              案件対応者CD
            </th>
            <th class="text-left">
              受付者CD
            </th>
            <th class="text-left">
              ｽﾃｰﾀｽ
            </th>
            <th class="text-left">
              更新日時
            </th>
            <th class="text-left">
              更新者CD
            </th>
            <th class="text-left">
              削除
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in bacs" :key="item.reception_number">
            <td>{{ item.reception_number }}</td>
            <td>{{ item.building_code }}</td>
            <td>{{ item.room_number }}</td>
            <td>{{ item.kname | trimFil }}</td>
            <td>{{ item.block_code }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.reception_ts }}</td>
            <td>{{ item.dept_code }}</td>
            <td>{{ item.ankentaiousha_id }}</td>
            <td>{{ item.uketsukebuka_shain_code }}</td>
            <td nowrap>{{ item.status }}</td>
            <td>{{ item.updatedTime }}</td>
            <td>{{ item.updated_by }}</td>
            <td>{{ item.deleted }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>
<script>
export default {
  filters: {
    trimFil(value) {
      if (value == null) {
        return ''
      }
      value = value.toString()
      return value.split('　').join('')
    },
  },
  async asyncData({ $axios }) {
    const url = '/api/bacs'
    const response = await $axios.$get(url)
    return {
      bacs: response,
    }
  },
  data() {
    return {
      ret: '',
      reception_number: '',
      building_code: '',
      room_number: '',
      kname: '',
      block_code: '',
      title: '',
      reception_ts: '',
      dept_code: '',
      ankentaiousha_id: '',
      uketsukebuka_code: '',
      uketsukebuka_shain_code: '',
      status: '',
      updated_at: '',
      deleted: '',
    }
  },
  methods: {
    async list() {
      this.ret = '画面更新中'
      const url = '/api/bacs'
      this.bacs = await this.$axios.$get(url)
      this.ret = ''
    },
    async update() {
      this.ret = '送信中'
      const url = '/api/bacs_update'
      this.ret = await this.$axios.$get(url)
      await this.list()
    },
  },
}
</script>
