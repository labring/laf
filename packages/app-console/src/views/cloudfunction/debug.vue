<template>
  <div class="app-container">
    <div v-if="func" class="header">
      <span style="font-size: 22px;line-height: 40px;">
        <b>{{ func.label }}</b>
        <span v-if="saved_code_diff" style="margin-left: 8px; font-size: 18px; color: red; cursor: pointer" @click="diffSaved">
          [编辑中<i class="el-icon-hot-water" /> ]
        </span>
      </span>
      <el-tag v-clipboard:message="func.name" v-clipboard:success="onCopy" style="margin-left: 14px; " size="mini" type="success">{{ func.name }}</el-tag>

      <el-tooltip content="重新加载函数代码，将会丢弃当前未保存的编辑" effect="light" placement="bottom">
        <el-button
          style="margin-left: 20px"
          icon="el-icon-refresh"
          type="text"
          size="default"
          :loading="loading"
          @click="getFunction"
        >刷新</el-button>
      </el-tooltip>
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
      <el-button
        v-if="published_func"
        type="text"
        size="mini"
        :loading="loading"
        style="margin-left: 10px;"
        @click="diffPublished"
      >对比已发布 (#{{ published_func.version }})</el-button>
      <el-button size="small" style="float: right;" type="primary" @click="showDebugPanel = true">显示调试面板(J)</el-button>
    </div>

    <div style="display: flex;">
      <div v-if="func" class="editor-container">
        <function-editor v-model="value" :name="func.name" :height="editorHeight" :dark="false" @change="cacheCode" />
      </div>
      <div class="latest-logs">
        <el-tabs type="border-card">
          <el-tab-pane label="最近执行">
            <span slot="label">最近执行 <i class="el-icon-refresh" @click="getLatestLogs" /></span>

            <div v-for="log in latestLogs" :key="log._id" class="log-item">
              <el-tag type="warning" size="normal" @click="showLogDetailDlg(log)">
                {{ log.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
              </el-tag>
            </div>
          </el-tab-pane>
          <el-tab-pane label="变更记录">
            <span slot="label">变更记录 <i class="el-icon-refresh" @click="getChangeHistory" /></span>
            <div v-for="(item, index) in changeHistory" :key="item._id" class="history-item" @click="showChangeDiffEditor(index)">
              <span class="history-title">#{{ item.data.version }}</span>
              <span style="font-weight: bold;margin-left: 2px;"> {{ item.account.name }} </span>
              <span style="color:rgb(85, 84, 84);"> {{ item.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-drawer
      title="调试面板"
      :visible="showDebugPanel"
      direction="rtl"
      size="40%"
      :destroy-on-close="false"
      :show-close="true"
      :modal="true"
      :wrapper-closable="true"
      @close="showDebugPanel = false"
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

    <!-- 代码对比编辑器对话框 -->
    <el-dialog v-if="diffCode.modified" :visible.sync="isShowDiffEditor" :title="diffCode.title" width="80%" top="10vh" @close="onCloseDiffEditor">
      <diff-editor :original="diffCode.original" :modified="diffCode.modified" :height="editorHeight * 0.8" />
    </el-dialog>
  </div>
</template>

<script>
import FunctionLogDetail from './components/FunctionLogDetail'
import FunctionEditor from '@/components/FunctionEditor'
import DiffEditor from '@/components/FunctionEditor/diff'
import jsonEditor from '@/components/JsonEditor/param'
import { getFunctionById, getFunctionLogs, getPublishedFunction, launchFunction, publishOneFunction, updateFunctionCode, getFunctionChangeHistory, compileFunctionCode } from '../../api/func'
import { showError, showSuccess } from '@/utils/show'
import { debounce } from 'lodash'
import { hashString } from '@/utils/hash'

const defaultParamValue = {
  code: 'laf'
}
export default {
  name: 'FunctionEditorPage',
  components: { FunctionEditor, jsonEditor, FunctionLogDetail, DiffEditor },
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
      latestLogs: [],
      // 当前查看日志详情
      logDetail: undefined,
      // 日志详情对话框显示控制
      isShowLogDetail: false,
      // 函数变更记录
      changeHistory: [],
      // 代码对比编辑器对话框显示控制
      isShowDiffEditor: false,
      // 代码对比编辑器数据
      diffCode: {
        original: '',
        modified: '',
        title: 'Code DiffEditor'
      }
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
    this.restoreCachedCode()
    this.getLatestLogs()
    this.getChangeHistory()
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
        debugParams: param
      }).finally(() => { this.loading = false })

      if (r.error) { return showError('保存失败！') }

      localStorage.removeItem(this.getCodeCacheKey(this.func.version))
      await this.getFunction()
      this.getChangeHistory()
      if (showTip) {
        showSuccess('已保存: ' + this.func.name)
      }
    },
    /**
     * 运行函数代码
     */
    async launch() {
      const debug_token = this.$store.state.app.debug_token
      const r = await compileFunctionCode(this.func._id, {
        code: this.value
      }).finally(() => { this.loading = false })

      if (this.loading) return

      this.loading = true
      const param = this.parseInvokeParam(this.invokeParams)
      const res = await launchFunction(r.data, param, debug_token)
        .finally(() => { this.loading = false })

      this.invokeRequestId = res.headers['x-request-id'] || res.headers['request-id'] || res.headers['requestid'] || res.headers['requestId']
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

      this.published_func = await getPublishedFunction(this.func._id)
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

      this.latestLogs = res.data || []
    },
    /**
     * 获取函数变更记录
     */
    async getChangeHistory() {
      this.loading = true
      const res = await getFunctionChangeHistory(this.func_id, 1, 30)
        .finally(() => { this.loading = false })

      this.changeHistory = res.data || []
    },
    /**
     * 查看日志详情
     */
    showLogDetailDlg(log) {
      this.logDetail = log
      this.isShowLogDetail = true
    },
    /**
     * 对比已发布与当前编辑的云函数代码
     */
    diffPublished() {
      this.diffCode.original = this.published_func.code
      this.diffCode.modified = this.value
      this.diffCode.title = `云函数代码变更对比：#${this.published_func.version}(已发布) -> (当前编辑）`
      this.isShowDiffEditor = true
    },
    /**
     * 对比已保存与当前编辑的云函数代码
     */
    diffSaved() {
      this.diffCode.original = this.func.code
      this.diffCode.modified = this.value
      this.diffCode.title = `云函数代码变更对比：#${this.func.version}(已保存) -> (当前编辑）`
      this.isShowDiffEditor = true
    },
    onCloseDiffEditor() {
      this.diffCode = {
        original: '',
        modified: '',
        title: 'Code DiffEditor'
      }
    },
    /**
     * 对比云函数版本记录的代码
     */
    showChangeDiffEditor(index) {
      const original = this.changeHistory[index]
      const modified = index > 0 ? this.changeHistory[index - 1] : null
      this.diffCode.original = original.data.code

      if (!modified) {
        this.diffCode.modified = this.value
        this.diffCode.title = `云函数代码变更对比：#${original.data.version} -> (当前编辑)`
      } else {
        this.diffCode.modified = modified.data.code
        this.diffCode.title = `云函数代码变更对比：#${original.data.version} -> #${modified.data.version}`
      }

      this.isShowDiffEditor = true
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
    },
    /** 本地缓存代码变更 */
    cacheCode(value) {
      const version = this.func.version
      localStorage.removeItem(this.getCodeCacheKey(version - 1))
      localStorage.setItem(this.getCodeCacheKey(version), value)
    },
    /** 加载本地缓存代码变更 */
    restoreCachedCode() {
      const key = this.getCodeCacheKey(this.func.version)
      const code = localStorage.getItem(key)
      if (code) {
        this.value = code
      }
    },
    /** 获取本地代码缓存 key */
    getCodeCacheKey(version) {
      return `$cached_function@${this.appid}::${this.func.name}#${version}`
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
  width: 80%;
  border: 1px solid lightgray;
  padding: 0;
}

.latest-logs {
  padding-left: 5px;
  width: 20%;

  .log-item {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;

    .time{
      margin-left: 10px;
    }
  }

  .history-item {
    margin-bottom: 10px;
    font-size: 13px;
    padding: 3px 0;
    cursor: pointer;
    .history-title {
      color: rgb(79, 79, 235);
      font-size: 15px;
      font-weight: bold;
      text-decoration: underline;
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

