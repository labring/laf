<template>
  <div class="application-container">
    <div class="welcome">
      欢迎使用 LaF 云开发！
    </div>
    <div class="introduce row">
      <div class="label">使用文档：</div>
      <div class="content">
        <a style="color: blue" target="_blank" href="https://laf.laogen.site/">https://laf.laogen.site/</a>
      </div>
    </div>
    <div class="row">
      <div class="label">应用名：</div>
      <div class="content">{{ app.name }}</div>
    </div>
    <div class="row">
      <div class="label">应用ID：</div>
      <div class="content">{{ app.appid }}</div>
    </div>
    <div class="row">
      <div class="label">服务地址：</div>
      <div class="content">
        <a style="color: blue"> {{ getAppUrl() }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import { getAppAccessUrl } from '@/api/application'

export default {
  name: 'Dashboard',
  components: { },
  data() {
    return {}
  },
  computed: {
    app() {
      return this.$store.state.app?.application
    }
  },
  async created() {
  },
  methods: {
    getAppUrl() {
      return getAppAccessUrl()
    }
  }
}
</script>

<style scoped>
.application-container {
  padding-top: 160px;
}

.welcome {
  width: 400px;
  margin: 0 auto;
  font-size: 26px;
  color: rgba(218, 165, 32);
  margin-bottom: 80px;
}

.row {

  width: 700px;
  margin: 0 auto;
  margin-top: 20px;
  display: flex;
}

.row .label {
  text-align: left;
  width: 80px;
  color: rgb(82, 80, 80);
  font-size: 16;
}

.row .content {
  color: black;
  padding-left: 10px;
}
</style>
