<template>
  <div class="dashboard-container">
    欢迎使用 LaF 开发运维控制台。
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  components: { },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
  }
}
</script>

<style scoped>
.dashboard-container {
  text-align: center;
  padding-top: 200px;
  font-size: 28px;
}
</style>
