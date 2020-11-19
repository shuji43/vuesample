<template>
  <div>
    <!--
    <li v-for="(post, key) in posts" :key="key">
    </li>
     -->
    <pre>
      status {{ post.status }}
      message {{ post.message }}
      description {{ post.description }}
      response_time {{ post.response_time }}
      result {{ post.result }}
      xid {{ xid }}
    </pre>
    <hr />
    <input v-model="accessToken" type="text" />
    <input v-model="xid" type="text" />
    <button @click="get_tran">トランザクションID取得</button>
    <hr />
    1:データURIスキーム、2:ダウンロードURL
    <input v-model="downloadType" type="text" />
    1:文書取得 2:署名済み文書取得
    <input v-model="operation" type="text" />
    管理番号
    <input v-model="controlNumber" type="text" />
    <button @click="get_document(xid)">文書取得</button>
    <hr />
    文書リンク
    <a :href="documentsUrl" target="_blank">{{ documentsUrl }}</a>
    <hr />
    <button @click="get_control_number">管理番号取得</button>
    <table class="table table-striped table-dark">
      <thead>
        <tr>
          <th>xid</th>
          <th>No</th>
          <th>name</th>
          <th>サイン</th>
          <th>作成</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in controlNumbers.document" :key="item.document_number">
          <template v-if="item.xid != ''">
            <td>{{ item.xid }}</td>
            <td>{{ item.control_number }}</td>
            <td>
              <a
                v-if="item.xid"
                href="javascript:void(0)"
                @click="get_document(item.xid)"
              >
                {{ item.document_name }}
              </a>
            </td>
            <td>{{ item.signing_datetime }}</td>
            <td>{{ item.created_at }}</td>
            <td>
              <button
                v-if="item.xid"
                class="btn btn-primary"
                @click="document_delete(item.xid)"
              >
                削除
              </button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
    {{ documentDelete }}
    <hr />
    <input name="uploadFile" type="file" @change="selectedFile" />
    <button @click="upload_doc">文書アップロード(PDFのみ)</button>
    {{ uploadResult }}
    <hr />
    <button @click="get_document_status">文書状態取得</button>
    {{ documentStatus }}
    <hr />
    <button @click="get_document_detail">文書詳細取得</button>
    {{ documentDetail }}
  </div>
</template>

<script>
export default {
  async asyncData({ $axios }) {
    const url = '/api/gmo_get_access_token'
    const response = await $axios.$get(url)
    return {
      accessToken: response.access_token,
      post: response.post,
    }
  },
  data() {
    return {
      accessToken: 'XXXXXX',
      xid: 'GAbVHtybqwD81r9iU',
      downloadType: '2',
      operation: '1',
      controlNumber: '', // '0000001',
      controlNumbers: '',
      documentsUrl: 'URL',
      uploadFile: '',
      uploadResult: '',
      documentStatus: '',
      documentDetail: '',
    }
  },
  methods: {
    async get_tran() {
      const url = '/api/gmo_get_transaction_id'
      const param = { accessToken: this.accessToken }
      const response = await this.$axios.$post(url, param)
      this.xid = response.xid
    },
    async get_document(xid1) {
      const url = '/api/gmo_get_document'
      const param = {
        access_token: this.accessToken,
        xid: xid1,
        download_type: this.downloadType,
        operation: this.operation,
        control_number: this.controlNumber,
      }
      const response = await this.$axios.$post(url, param)
      this.documentsUrl = response.documents_url
      window.location = this.documentsUrl
    },
    selectedFile(e) {
      // 選択された File の情報を保存しておく
      e.preventDefault()
      const files = e.target.files
      this.uploadFile = files[0]
    },
    async upload_doc() {
      const url = '/api/gmo_upload_doc'
      const param = new FormData()
      param.append('access_token', this.accessToken)
      param.append('xid', this.xid)
      param.append('uploadFile', this.uploadFile)
      const response = await this.$axios.$post(url, param, {
        headers: {
          'content-type': 'multipart/form-data',
        },
      })
      this.uploadResult = response.result
    },
    async get_control_number() {
      const url = '/api/gmo_get_control_number'
      const param = {
        access_token: this.accessToken,
      }
      const response = await this.$axios.$post(url, param)
      this.controlNumbers = response.result
    },
    async get_document_status() {
      const url = '/api/gmo_get_document_status'
      const param = {
        access_token: this.accessToken,
        xid: this.xid,
      }
      const response = await this.$axios.$post(url, param)
      this.documentStatus = response.result
    },
    async get_document_detail() {
      const url = '/api/gmo_get_document_detail'
      const param = {
        access_token: this.accessToken,
        xid: this.xid,
        control_number: this.controlNumber,
      }
      const response = await this.$axios.$post(url, param)
      this.documentDetail = response.result
    },
    async document_delete(xid1) {
      const url = '/api/gmo_document_delete'
      const param = {
        access_token: this.accessToken,
        xid: xid1,
      }
      const response = await this.$axios.$post(url, param)
      this.documentDelete = response.result
      this.get_control_number()
    },
  },
}
</script>
