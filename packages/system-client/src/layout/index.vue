<template>
  <div class="app-wrapper">
    <navbar class="fixed-header" />
    <app-main />
  </div>
</template>

<script>
import { AppMain, Navbar } from './components'
import { mapState } from 'vuex'
export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar
  },
  computed: {
    ...mapState({
      device: state => state.app.device,
      showSettings: state => state.settings.showSettings,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader
    }),
    classObj() {
      return {
        mobile: this.device === 'mobile'
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>

  .app-wrapper {

  }
  .fixed-header {
    position: fixed;
    top: 0;
    z-index: 9;
    width: 100%;
    transition: width 0.28s;
  }
</style>
