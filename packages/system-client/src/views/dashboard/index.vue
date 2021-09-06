<template>
  <div class="application-container">
    <div class="welcome">
      欢迎使用 LaF 云开发！
    </div>
    <div class="introduce">
      使用文档:
      <a style="color: blue" target="_blank" href="https://laf.laogen.site/">https://laf.laogen.site/</a>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Dashboard',
  components: { },
  data() {
    return {}
  },
  async created() {
  },
  methods: {
  }
}
</script>

<style scoped>
.application-container {
  padding-top: 200px;
}

.welcome {
  width: 400px;
  margin: 0 auto;
  font-size: 26px;
  color: rgba(218, 165, 32)
}

.introduce {
  width: 400px;
  margin: 0 auto;
  text-align: left;
  margin-top: 20px;
  color: rgb(126, 123, 123);
}
</style>
