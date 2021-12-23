<template>
  <div class="app-wrapper">
    <navbar :hide-tags="true" class="fixed-header" />
    <div class="main">
      <app-main />
    </div>
  </div>
</template>

<script>
import { AppMain, Navbar } from './components'
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar
  },
  mixins: [ResizeMixin],
  computed: {
  },
  created() {
    console.log('main layout created')
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
  .app-wrapper {
    .main {
      padding-top: 50px;
      display: flex;
    }
  }
  .fixed-header {
    position: fixed;
    top: 0;
    z-index: 9;
    width: 100%;
    transition: width 0.28s;
  }
</style>
