<script lang="ts" setup>
import { debounce } from 'lodash'
import FunctionLogDetail from './components/FunctionLogDetail.vue'
import { compileFunctionCode, getFunctionById, getFunctionChangeHistory, getFunctionLogs, getPublishedFunction, launchFunction, publishOneFunction, updateFunctionCode } from '~/api/func'
import JsonEditor from '~/components/JsonEditor/param.vue'
import FunctionEditor from '~/components/FunctionEditor/index.vue'
import DiffEditor from '~/components/FunctionEditor/diff.vue'
import { useAppStore } from '~/store/app'
import { hashString } from '~/utils/hash'

const $route = useRoute()

const defaultParamValue = {
  code: 'laf',
}

const appStore = useAppStore()

const appId = appStore.currentApp.appid
const debug_token = appStore.debugToken

let loading = $ref(false)
let value = $ref('')
let editorHeight = $ref(500)
let func: any = $ref(null)
let published_func = $ref<{ version?: string; code: string }>({ code: '' })
let func_id = $ref('')
let invokeResult = $ref(null)
let invokeLogs = $ref(null)
let invokeTimeUsage = $ref(null)
let invokeRequestId = $ref('')
let showDebugPanel = $ref(false)
let latestLogs: any = $ref([])
let logDetail = $ref(undefined)
let isShowLogDetail = $ref(false)
let changeHistory: any = $ref([])
let isShowDiffEditor = $ref(false)
let diffCode = $ref({ original: '', modified: '', title: 'Code DiffEditor' })

let invokeParams: any = $ref(defaultParamValue)

const published_version_diff = $computed(() => {
  const cur = func?.version
  const pub = published_func?.version
  return cur !== pub
})

const saved_code_diff = $computed(() => {
  const cur = hashString(value)
  const saved = func?.hash
  return cur !== saved
})

async function getFunction() {
  loading = true
  const r = await getFunctionById(func_id)
  if (r.error)
    return ElMessage.error(`加载函数失败: ${r.error}`)

  func = r.data
  value = func.code
  invokeParams
    = parseInvokeParam(func.debugParams) ?? defaultParamValue
  loading = false

  published_func = await getPublishedFunction(func_id)
}

async function updateFunc(showTip = true) {
  if (!saved_code_diff)
    return

  if (loading)
    return

  if (validate())
    return

  loading = true

  let param = invokeParams
  if (typeof param !== 'string')
    param = JSON.stringify(invokeParams)

  const r = await updateFunctionCode(func._id, {
    code: value,
    debugParams: param,
  }).finally(() => {
    loading = false
  })

  if (r.error)
    return ElMessage.error('保存失败！')

  localStorage.removeItem(getCodeCacheKey(func.version))
  await getFunction()
  getChangeHistory()
  if (showTip)
    ElMessage.success(`已保存: ${func.name}`)
}

async function launch() {
  if (loading)
    return

  loading = true

  const r = await compileFunctionCode(func._id, {
    code: value,
  }).finally(
    () => {
      loading = false
    },
  )

  const param = parseInvokeParam(invokeParams)
  const res = await launchFunction(r.data, param, debug_token).finally(
    () => {
      loading = false
    },
  )

  invokeRequestId
    = res.headers['x-request-id']
    || res.headers['request-id']
    || res.headers.requestid
    || res.headers.requestId
  await getLogByRequestId(invokeRequestId).finally(() => {
    loading = false
  })

  ElMessage.success('运行成功')
  invokeResult = res.data
  getLatestLogs()
}

async function publishFunction() {
  if (loading)
    return

  if (validate())
    return

  loading = true

  const r = await publishOneFunction(func._id).finally(() => {
    loading = false
  })

  if (r.error)
    return ElMessage.error('发布失败!')

  published_func = await getPublishedFunction(func._id)
  ElMessage.success(`已发布: ${func.name}`)
}

async function getLogByRequestId(requestId: string) {
  loading = true
  const res = await getFunctionLogs({ requestId }, 1, 1).finally(() => {
    loading = false
  })

  if (res.data?.length) {
    invokeLogs = res.data[0]?.logs
    invokeTimeUsage = res.data[0]?.time_usage
  }
}

async function getLatestLogs() {
  loading = true
  const res = await getFunctionLogs(
    { func_id },
    1,
    15,
  ).finally(() => {
    loading = false
  })

  latestLogs = res.data || []
}

async function getChangeHistory() {
  loading = true
  const res = await getFunctionChangeHistory(func_id, 1, 30).finally(
    () => {
      loading = false
    },
  )

  changeHistory = res.data || []
}

function showLogDetailDlg(log: undefined) {
  logDetail = log
  isShowLogDetail = true
}

function diffPublished() {
  diffCode.original = published_func.code
  diffCode.modified = value
  diffCode.title = `云函数代码变更对比：#${published_func.version}(已发布) -> (当前编辑）`
  isShowDiffEditor = true
}

function diffSaved() {
  diffCode.original = func.code
  diffCode.modified = value
  diffCode.title = `云函数代码变更对比：#${func.version}(已保存) -> (当前编辑）`
  isShowDiffEditor = true
}

function onCloseDiffEditor() {
  diffCode = {
    original: '',
    modified: '',
    title: 'Code DiffEditor',
  }
}

function showChangeDiffEditor(index: number) {
  const original = changeHistory[index]
  const modified = index > 0 ? changeHistory[index - 1] : null
  diffCode.original = original.data.code

  if (!modified) {
    diffCode.modified = value
    diffCode.title = `云函数代码变更对比：#${original.data.version} -> (当前编辑)`
  }
  else {
    diffCode.modified = modified.data.code
    diffCode.title = `云函数代码变更对比：#${original.data.version} -> #${modified.data.version}`
  }

  isShowDiffEditor = true
}

function setTagViewTitle() {
  const label = func.label
  const title = $route.meta.title
  const _route = Object.assign({}, $route, {
    title: `${title}: ${label}`,
  })
  // $store.dispatch('tagsView/updateVisitedView', route)
}

function validate() {
  let error = null

  if (value === '')
    error = '函数值不可为空'

  if (error) {
    ElMessage.error(error)
    return error
  }
  return null
}

function parseInvokeParam(data: any): Promise<any> {
  let param
  try {
    param = JSON.parse(data)
  }
  catch (error) {
    param = data
  }

  return param
}

async function bindShortKey(e: { ctrlKey: any; metaKey: any; key: string; preventDefault: () => void }) {
  // Ctrl + s 为保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    updateFunc()
    e.preventDefault()
  }

  // Ctrl + j 弹出/隐藏调试框
  if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
    showDebugPanel = !showDebugPanel
    e.preventDefault()
  }

  // Ctrl + b 为调试运行，并弹出调试框
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    showDebugPanel = true
    launch()
    e.preventDefault()
  }
}

function updateEditorHeight() {
  const height = document.body.clientHeight
  editorHeight = height - 110
}

function cacheCode(value: string) {
  const version = func.version
  localStorage.removeItem(getCodeCacheKey(version - 1))
  localStorage.setItem(getCodeCacheKey(version), value)
}

function restoreCachedCode() {
  const key = getCodeCacheKey(func.version)
  const code = localStorage.getItem(key)
  if (code)
    value = code
}

function getCodeCacheKey(version: number) {
  return `$cached_function@${appId}::${func.name}#${version}`
}

onMounted(async () => {
  func_id = $route.params.id.toString()
  await getFunction()
  restoreCachedCode()
  getLatestLogs()
  getChangeHistory()
  setTagViewTitle()

  nextTick(() => {
    updateEditorHeight()
    window.addEventListener('resize', debounce(() => {
      updateEditorHeight()
    }))
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', bindShortKey, false)
})

onUnmounted(() => {
  document.removeEventListener('keydown', bindShortKey, false)
})

onActivated(() => {
  document.removeEventListener('keydown', bindShortKey, false)
  document.addEventListener('keydown', bindShortKey, false)
})

onDeactivated(() => {
  document.removeEventListener('keydown', bindShortKey, false)
})
</script>

<template>
  <div class="app-container min-h-300px">
    <div v-if="func">
      <div class="header mb-12px">
        <span>
          <b>{{ func.label }}</b>
          <span
            v-if="saved_code_diff" style="margin-left: 8px; color: red; cursor: pointer"
            @click="diffSaved"
          >
            [编辑中<el-icon><HotWater /></el-icon> ]
          </span>
        </span>
        <Copy :text="func.name" />

        <el-tooltip content="重新加载函数代码，将会丢弃当前未保存的编辑" effect="light" placement="bottom">
          <el-button
            style="margin-left: 20px" icon="Refresh" link size="default" :loading="loading"
            @click="getFunction"
          >
            刷新
          </el-button>
        </el-tooltip>
        <el-button
          style="margin-left: 20px" :loading="loading" :disabled="!saved_code_diff"
          :type="saved_code_diff ? 'success' : 'success'" @click="updateFunc"
        >
          保存(S)
        </el-button>
        <el-button
          :type="published_version_diff ? 'default' : ''" :loading="loading"
          link
          style="margin-left: 15px" :disabled="!published_version_diff" @click="publishFunction"
        >
          {{ published_version_diff ? '发布' : '已发布' }}
        </el-button>
        <el-button
          v-if="published_func" link :loading="loading" style="margin-left: 10px"
          @click="diffPublished"
        >
          对比已发布 (#{{ published_func.version }})
        </el-button>
        <el-button style="float: right" type="primary" @click="showDebugPanel = true">
          显示调试面板(J)
        </el-button>
      </div>

      <div style="display: flex; height: calc(100vh - 140px)">
        <div v-if="func" class="editor-container  w-78/100 mr-12px">
          <FunctionEditor v-model="value" :name="func.name" :height="editorHeight" :dark="false" @change="cacheCode" />
        </div>
        <div class="latest-logs w-1/5">
          <el-tabs type="border-card">
            <el-tab-pane label="最近执行">
              <template #label>
                <span>最近执行 <el-icon @click="getLatestLogs"><Refresh /></el-icon></span>
              </template>

              <div v-for="log in latestLogs" :key="log._id" class="log-item">
                <el-tag type="warning" size="small" @click="showLogDetailDlg(log)">
                  {{
                    $filters.formatTime(log.created_at)
                  }}
                </el-tag>
              </div>
            </el-tab-pane>
            <el-tab-pane label="变更记录">
              <template #label>
                <span>变更记录 <el-icon @click="getChangeHistory"><Refresh /></el-icon> </span>
              </template>
              <div
                v-for="(item, index) in changeHistory" :key="item._id" class="history-item"
                @click="showChangeDiffEditor(index)"
              >
                <span class="history-title">#{{ item.data.version }}</span>
                <span style="font-weight: bold; margin-left: 2px">
                  {{ item.account.name }}
                </span>
                <span style="color: rgb(85, 84, 84)">
                  {{
                    $filters.formatTime(item.created_at)
                  }}</span>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <div v-else v-loading="loading" class="min-h-300px" />

    <el-drawer
      v-model="showDebugPanel" title="调试面板" direction="rtl" size="40%" :destroy-on-close="false"
      :show-close="true" :modal="true" :close-on-click-modal="true" @close="showDebugPanel = false"
    >
      <div class="invoke-panel">
        <div class="title mb-12px">
          调用参数
          <el-button type="success" :loading="loading" class="ml-10px" size="small" @click="launch">
            运行(B
          </el-button>
        </div>
        <div class="editor">
          <JsonEditor v-model="invokeParams" :line-numbers="false" :height="300" :dark="false" />
        </div>
        <div v-if="invokeRequestId" class="invoke-result">
          <div class="title">
            执行日志
            <span v-if="invokeRequestId">（ RequestId: {{ invokeRequestId }} ）</span>
          </div>
          <div v-if="invokeLogs" class="logs">
            <div v-for="(log, index) in invokeLogs" :key="index" class="log-item">
              <pre>- {{ log }}</pre>
            </div>
          </div>
          <div class="title" style="margin-top: 20px">
            调用结果
            <span v-if="invokeTimeUsage"> （ {{ invokeTimeUsage }} ms ）</span>
          </div>
          <div class="result">
            <pre>{{ invokeResult }}</pre>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 日志详情对话框 -->
    <el-dialog v-if="logDetail" v-model="isShowLogDetail" title="日志详情">
      <FunctionLogDetail :data="logDetail" />
    </el-dialog>

    <!-- 代码对比编辑器对话框 -->
    <el-dialog
      v-model="isShowDiffEditor" :title="diffCode.title" width="80%" top="10vh"
      @close="onCloseDiffEditor"
    >
      <DiffEditor :original="diffCode.original" :modified="diffCode.modified" :height="editorHeight * 0.8" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
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

<route lang="yaml">
name: debug
hidden: true
meta:
  title: 云函数-调试
  index: 1-0
</route>
