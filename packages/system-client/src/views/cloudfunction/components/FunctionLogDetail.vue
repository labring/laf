<template>
  <div class="invoke-logs">
    <div class="title">
      执行日志
      <span
        v-if="data"
      >（ RequestId: {{ data.requestId }} ）</span>
      <span
        v-if="data"
      > [ {{ data.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }} ]</span>
    </div>
    <div class="logs">
      <div v-for="(log, index) in logs" :key="index" class="log-item">
        <pre>- {{ log }}</pre>
      </div>
    </div>

    <div class="title" style="margin-top: 15px;"> 返回结果 </div>
    <div class="logs">
      <pre>{{ returnValue }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FunctionLogDetail',
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    // 云函数的日志
    logs() {
      return this.data?.logs
    },
    // 云函数执行用时
    invokeTime() {
      return this.data?.time_usage
    },
    // 云函数调用结果
    returnValue() {
      return this.data?.data
    }
  },
  async created() {
  }
}
</script>

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
    }
  }

</style>

