<template>
  <div class="app-container">
    <div v-if="func" class="header">
      <span style="font-size: 22px;line-height: 40px;">
        <!-- <el-tag v-if="saved_code_diff" type="warning" size="mini" effect="plain">*</el-tag> -->
        <b>{{ func.label }}</b>
        <span v-if="saved_code_diff" style="margin-left: 8px; font-size: 18px; color: red">
          <i class="el-icon-edit" />
        </span>
      </span>
      <el-tag v-clipboard:message="func.name" v-clipboard:success="onCopy" style="margin-left: 14px; " size="mini" type="success">{{ func.name }}</el-tag>

      <el-button
        style="margin-left: 20px"
        icon="el-icon-refresh"
        type="text"
        size="default"
        :loading="loading"
        @click="getFunction"
      >刷新</el-button>
      <el-button
        size="mini"
        style="margin-left: 20px;"
        :loading="loading"
        :disabled="!saved_code_diff"
        :type="saved_code_diff ? 'success' : 'success'"
        @click="updateFunc"
      >保存(S)</el-button>
      <el-button
        :type="published_version_diff ? 'default' : 'text'"
        size="mini"
        :loading="loading"
        style="margin-left: 15px;"
        :disabled="!published_version_diff"
        @click="publishFunction"
      >{{ published_version_diff ? '发布': '已发布' }}</el-button>
      <el-button size="small" style="float: right;" type="primary" @click="showDebugPanel = true">显示调试面板(J)</el-button>
    </div>

    <div style="display: flex;">
      <div class="editor-container">
        <function-editor v-model="value" :height="editorHeight" :dark="false" />
      </div>
      <div class="lastest-logs">
        <el-card shadow="never" :body-style="{ padding: '20px' }">
          <div slot="header">
            <span>最近执行</span>
            <el-button style="float: right; padding: 3px 0" type="text" @click="getLatestLogs">刷新</el-button>
          </div>
          <div v-for="log in lastestLogs" :key="log._id" class="log-item">
            <el-tag type="warning" size="normal" @click="showLogDetailDlg(log)">
              {{ log.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
            </el-tag>
          </div>
        </el-card>
      </div>
    </div>

    <el-drawer
      title="调试面板"
      :visible.sync="showDebugPanel"
      direction="rtl"
      size="40%"
      :destroy-on-close="false"
      :show-close="true"
      :modal="true"
      :wrapper-closable="true"
    >

      <div class="invoke-panel">
        <div class="title">
          调用参数
          <el-button
            size="mini"
            type="success"
            style="margin-left: 10px"
            :loading="loading"
            @click="launch"
          >运行(B)</el-button>
        </div>
        <div class="editor">
          <json-editor
            v-model="invokeParams"
            :line-numbers="false"
            :height="300"
            :dark="false"
          />
        </div>
        <div v-if="invokeRequestId" class="invoke-result">
          <div class="title">
            执行日志
            <span
              v-if="invokeRequestId"
            >（ RequestId: {{ invokeRequestId }} ）</span>
          </div>
          <div v-if="invokeLogs" class="logs">
            <div v-for="(log, index) in invokeLogs" :key="index" class="log-item">
              <pre>- {{ log }}</pre>
            </div>
          </div>
          <div class="title" style="margin-top: 20px">
            调用结果 <span v-if="invokeTimeUsage"> （ {{ invokeTimeUsage }} ms ）</span>
          </div>
          <div class="result">
            <pre>{{ invokeResult }}</pre>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 日志详情对话框 -->
    <el-dialog v-if="logDetail" :visible.sync="isShowLogDetail" title="日志详情">
      <FunctionLogDetail :data="logDetail" />
    </el-dialog>
  </div>
</template>

<script>
import FunctionLogDetail from './components/FunctionLogDetail'
import FunctionEditor from '@/components/FunctionEditor'
import jsonEditor from '@/components/JsonEditor/param'
import { getFunctionById, getFunctionLogs, getPublishedFunction, launchFunction, publishOneFunction, updateFunctionCode } from '../../api/func'
import { showError, showSuccess } from '@/utils/show'
import { debounce } from 'lodash'
import { hashString } from '@/utils/hash'

const defaultParamValue = {
  code: 'laf'
}
export default {
  name: 'FunctionEditorPage',
  components: { FunctionEditor, jsonEditor, FunctionLogDetail },
  data() {
    return {
      loading: false,
      value: '',
      editorHeight: 500,
      func: null,
      published_func: null,
      func_id: '',
      invokeParams: defaultParamValue,
      // 调用云函数返回的值
      invokeResult: null,
      // 调用云函数的日志
      invokeLogs: null,
      // 云函数执行用时
      invokeTimeUsage: null,
      // 云函数调用 request id
      invokeRequestId: null,
      // 调试面板显示控制
      showDebugPanel: false,
      // 最近日志
      lastestLogs: [],
      // 当前查看日志详情
      logDetail: undefined,
      // 日志详情对话框显示控制
      isShowLogDetail: true
    }
  },
  computed: {
    appid() {
      return this.app.appid
    },
    app() {
      return this.$store.state.app.application
    },
    published_version_diff() {
      const cur = this.func?.version
      const pub = this.published_func?.version
      return cur !== pub
    },
    published_code_diff() {
      const cur = this.func?.hash
      const pub = this.published_func?.hash
      return cur !== pub
    },
    saved_code_diff() {
      const cur = hashString(this.value)
      const saved = this.func?.hash
      return cur !== saved
    }
  },
  watch: {
    func(val) {
      this.value = val.code
    }
  },
  async created() {
    this.func_id = this.$route.params.id
    await this.getFunction()
    this.getLatestLogs()
    this.setTagViewTitle()
  },
  mounted() {
    this.updateEditorHeight()
    document.removeEventListener('keydown', this.bindShortKey, false)
    document.addEventListener('keydown', this.bindShortKey, false)
    window.addEventListener('resize', debounce(() => {
      this.updateEditorHeight()
    }))
  },
  activated() {
    document.removeEventListener('keydown', this.bindShortKey, false)
    document.addEventListener('keydown', this.bindShortKey, false)
  },
  deactivated() {
    document.removeEventListener('keydown', this.bindShortKey, false)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.bindShortKey, false)
  },
  methods: {
    /**
     * 获取函数数据
     */
    async getFunction() {
      const func_id = this.func_id
      this.loading = true
      const r = await getFunctionById(func_id)
      if (r.error) { return showError('加载函数失败: ' + r.error) }

      this.func = r.data
      this.value = this.func.code
      this.invokeParams = this.parseInvokeParam(this.func.debugParams) ?? defaultParamValue
      this.loading = false

      this.published_func = await getPublishedFunction(func_id)
    },
    /**
     * 保存函数代码
     */
    async updateFunc(showTip = true) {
      if (!this.saved_code_diff) {
        return
      }
      if (this.loading) { return }
      if (this.validate()) { return }

      this.loading = true

      let param = this.invokeParams
      if (typeof param !== 'string') {
        param = JSON.stringify(this.invokeParams)
      }

      const r = await updateFunctionCode(this.func._id, {
        code: this.value,
        update_at: Date.now(),
        debugParams: param
      }).finally(() => { this.loading = false })

      if (r.error) { return showError('保存失败！') }

      await this.getFunction()
      if (showTip) {
        showSuccess('已保存: ' + this.func.name)
      }
    },
    /**
     * 运行函数代码
     */
    async launch() {
      const debug_token = this.$store.state.app.debug_token
      await this.updateFunc(false)
      if (this.loading) return

      this.loading = true
      const param = this.parseInvokeParam(this.invokeParams)
      const res = await launchFunction(this.func, param, debug_token)
        .finally(() => { this.loading = false })

      this.invokeRequestId = res.headers['requestid']
      await this.getLogByRequestId(this.invokeRequestId)
        .finally(() => { this.loading = false })

      this.$message.success('运行成功')
      this.invokeResult = res.data
      this.getLatestLogs()
    },
    /**
     * 发布函数
     */
    async publishFunction() {
      if (this.loading) { return }
      if (this.validate()) { return }

      this.loading = true

      const r = await publishOneFunction(this.func._id)
        .finally(() => { this.loading = false })

      if (r.error) { return showError('发布失败!') }

      this.getFunction()
      showSuccess('已发布: ' + this.func.name)
    },
    async getLogByRequestId(requestId) {
      this.loading = true
      const res = await getFunctionLogs({ requestId }, 1, 1)
        .finally(() => { this.loading = false })

      if (res.data?.length) {
        this.invokeLogs = res.data[0]?.logs
        this.invokeTimeUsage = res.data[0]?.time_usage
      }
    },
    /**
     * 获取最近日志
     */
    async getLatestLogs() {
      this.loading = true
      const res = await getFunctionLogs({ func_id: this.func_id }, 1, 15)
        .finally(() => { this.loading = false })

      this.lastestLogs = res.data || []
    },
    showLogDetailDlg(log) {
      this.logDetail = log
      this.isShowLogDetail = true
    },
    setTagViewTitle() {
      const label = this.func.label
      const title = this.$route.meta.title
      const route = Object.assign({}, this.$route, { title: `${title}: ${label}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    validate() {
      let error = null

      if (this.value === '') {
        error = '函数值不可为空'
      }

      if (error) {
        this.$message(error)
        return error
      }
      return null
    },
    // 解析函数调试参数
    parseInvokeParam(data) {
      let param
      try {
        param = JSON.parse(data)
      } catch (error) {
        param = data
      }

      return param
    },
    // 快捷键绑定
    async bindShortKey(e) {
      // Ctrl + s 为保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        this.updateFunc()
        e.preventDefault()
      }

      // Ctrl + j 弹出/隐藏调试框
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        this.showDebugPanel = !this.showDebugPanel
        e.preventDefault()
      }

      // Ctrl + b 为调试运行，并弹出调试框
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        this.showDebugPanel = true
        this.launch()
        e.preventDefault()
      }
    },
    onCopy() {
      this.$message.success('函数名已复制')
    },
    updateEditorHeight() {
      const height = document.body.clientHeight
      this.editorHeight = height - 110
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding-top: 6px;
  padding-bottom: 0;
}
.editor-container {
  position: relative;
  height: 100%;
  width: 90%;
  border: 1px solid lightgray;
  padding: 0;
}

.lastest-logs {
  padding-left: 20px;
  padding-top: 10px;
  width: 15%;

  .log-item {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;

    .time{
      margin-left: 10px;
    }
  }
}

.invoke-panel {
  padding-left: 20px;
  padding-top: 10px;
  width: 100%;
  height: calc(90vh);
  padding-bottom: 20px;
  overflow-y: scroll;
  overflow-x: hidden;

  .title {
    font-weight: bold;
    span {
      font-weight: normal;
      color: gray;
    }
  }
  .editor {
    margin-top: 10px;
    border: 1px dashed gray;
    margin-left: 2px;
    width: 100%;
  }
  .invoke-result {
    margin-top: 20px;
    .logs {
      margin-top: 10px;
      padding: 10px;
      padding-left: 20px;
      background: rgba(233, 243, 221, 0.472);
      border-radius: 10px;
      overflow-x: auto;
    }
    .result {
      margin-top: 10px;
      padding: 16px;
      background: rgba(233, 243, 221, 0.472);
      border-radius: 10px;
      overflow-x: auto;
    }
  }
}
</style>

