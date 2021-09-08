<template>
  <div class="app-wrapper">
    <navbar :title="title" class="fixed-header" />
    <div class="main">
      <div class="sidebar">
        <sidebar class="sidebar-container" />
      </div>
      <app-main v-if="app" />
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { AppMain, Navbar, Sidebar } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { resetRouter } from '@/router'

export default {
  name: 'AppLayout',
  components: {
    AppMain,
    Navbar,
    Sidebar
  },
  mixins: [ResizeMixin],
  computed: {
    title() {
      return this.app?.name
    },
    app() {
      return store.state.app.application
    }
  },
  async created() {
    console.log('app layout created', this.$route)
    if (!this.app) {
      this.$router.push({
        path: '/applications'
      })
    }
  },
  beforeDestroy() {
    resetRouter()
    store.dispatch('tagsView/delAllViews')
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
  .app-wrapper {
    .sidebar {
      box-shadow: 1 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
    }
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
