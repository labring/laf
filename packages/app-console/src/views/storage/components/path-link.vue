<template>
  <div v-if="items.length" class="path-link-wrap">
    <span v-for="it in items" :key="it.path" @click="onClick(it)">
      <span v-if="it.path === '/'" style="margin-right: 2px; font-weight: bold">
        <span class="item-link">{{ it.name }}</span>
      </span>
      <span v-if="it.path !== '/'">
        <span class="item-link">{{ it.name }}</span>
      </span>
      <span style="margin: 0 1px;color: gray;">/</span>
    </span>
  </div>
</template>

<script>
import store from '@/store'

export default {
  name: 'PathLink',
  props: {
    path: {
      type: String,
      default: '/'
    },
    bucket: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      items: []
    }
  },
  watch: {
    path() {
      this.resolvePath()
    }
  },
  created() {
    this.resolvePath()
  },
  methods: {
    onClick(item) {
      if (!item) { return this.$emit('change', '/') }
      this.$emit('change', item.path)
    },
    /**
     * resolve `/pa/to/x` to:
     * ```
     * [
     *  { name: 'pa', parent: '/'},
     *  { name: 'to', parent: '/pa'},
     *  { name: 'x', parent: '/pa/to'},
     * ]
     * ```
     */
    resolvePath() {
      const appid = store.state.app.appid
      const strs = this.path.split('/')
        .filter(str => str !== '')

      const arr = strs.map(name => {
        return { name, path: '' }
      })

      arr.unshift({ name: `${appid}-${this.bucket}`, path: '/' })
      for (let i = 1; i < arr.length; i++) {
        const pre = arr[i - 1]
        arr[i].path = pre.path + arr[i].name + '/'
      }

      this.items = [...arr]
    }
  }
}
</script>

<style>
.path-link-wrap {
  display: inline-block;
}

.item-link {
  color: blue;
  /* text-decoration: underline; */
  cursor: pointer;
}
</style>
