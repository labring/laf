<script lang="ts" setup>
import { useAppStore } from '~/store'
const props = defineProps({
  path: {
    type: String,
    default: '/',
  },
  bucket: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['change'])

const appStore = useAppStore()

let items: any = $ref([])

function onClick(item: { path: any }) {
  if (!item)
    return emit('change', '/')
  emit('change', item.path)
}

function resolvePath(path: string) {
  const appid = appStore.currentApp.appid
  const strs = path.split('/')
    .filter((str: string) => str !== '')

  const arr = strs.map((name: any) => {
    return { name, path: '' }
  })

  arr.unshift({ name: `${appid}-${props.bucket}`, path: '/' })
  for (let i = 1; i < arr.length; i++) {
    const pre = arr[i - 1]
    arr[i].path = `${pre.path + arr[i].name}/`
  }

  items = [...arr]
}

onMounted(() => {
  resolvePath(props.path)
})
watch(() => props.path, (path) => {
  resolvePath(path)
})
</script>

<template>
  <div v-if="items.length" class="path-link-wrap inline-block">
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

<style scoped>
.item-link {
  color: blue;
  cursor: pointer;
}
</style>
