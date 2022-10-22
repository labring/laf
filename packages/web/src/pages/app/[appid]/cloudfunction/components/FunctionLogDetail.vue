<script lang="ts" setup>
const props = defineProps<{
  data: {
    logs: any[]
    requestId: string
    created_at: string
    time_usage: number
    data: any
  }
}>()

// 云函数的日志
const logs = $computed(() => {
  return props.data?.logs
})

// 云函数调用结果
const returnValue = $computed(() => {
  return props.data?.data
})
</script>

<template>
  <div class="invoke-logs">
    <div class="title mb-6px">
      执行日志
      <span v-if="data">（ RequestId: {{ props.data.requestId }} ）</span>
      <span v-if="data">
        [
        {{
          $filters.formatTime(props.data.created_at)
        }}
        ]</span>
    </div>
    <div class="logs mb-24px min-h-60px">
      <div v-if="logs">
        <div v-for="(log, index) in logs" :key="index" class="log-item text-xs">
          <pre>- {{ log }}</pre>
        </div>
      </div>
      <div v-else>
        无
      </div>
    </div>

    <div class="title mb-6px">
      返回结果
    </div>
    <div class="logs min-h-60px text-xs">
      <pre v-if="returnValue">{{ returnValue }}</pre>
      <pre v-else>无</pre>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.invoke-logs {
  .title {
    font-weight: bold;

    span {
      font-weight: normal;
      color: gray;
    }
  }

  .logs {
    padding: 10px;
    padding-left: 20px;
    background: rgba(233, 243, 221, 0.472);
    border-radius: 6px;
    overflow-x: auto;
  }

  .result {
    margin-top: 10px;
    padding: 16px;
    background: rgba(233, 243, 221, 0.472);
    border-radius: 6px;
  }
}
</style>
