<script lang="ts" setup>
import JsonEditor from '~/components/JsonEditor/param.vue'

const props = defineProps<{
  invokeParams: any
  invokeRequestId?: string
  invokeTimeUsage?: number
  invokeLogs?: string[]
  invokeResult?: any
}>()
</script>

<template>
  <div class="flex flex-col h-full">
    <div>
      调用参数
    </div>
    <div class="h-300px">
      <JsonEditor v-model="invokeParams" :line-numbers="false" :height="100" :dark="false" />
    </div>
    <div v-if="props.invokeRequestId" class="invoke-result">
      <div class="title">
        执行日志
        <span v-if="props.invokeRequestId">（ RequestId: {{ props.invokeRequestId }} ）</span>
      </div>
      <div v-if="invokeLogs" class="logs">
        <div v-for="(log, index) in invokeLogs" :key="index" class="log-item">
          <pre class="text-sm">- {{ log }}</pre>
        </div>
      </div>
      <div class="title" style="margin-top: 20px">
        调用结果
        <span v-if="props.invokeTimeUsage"> （ {{ props.invokeTimeUsage }} ms ）</span>
      </div>
      <div class="result overflow-auto">
        <pre class="text-sm">{{ props.invokeResult }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
</style>
