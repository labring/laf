<script setup lang="ts">
import { useMenuStore } from '~/store'

const router = useRouter()
const menuStore = useMenuStore()

const menus = ref<any>(menuStore.appMenus)

const switchRoute = (item: any) => {
  const path = item.path
  router.push(path)
}
</script>

<template>
  <el-menu h-screen background-color="#FAFBFC" text-color="#000" active-text-color="#09e">
    <el-sub-menu v-for="item in menus" :key="item.name" :collapse="false" :index="item.name">
      <template #title>
        <el-icon>
          <setting />
        </el-icon>
        <span>{{ item.name }}</span>
      </template>
      <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path" @click="switchRoute(child)">
        <!-- <el-icon><location /></el-icon> -->
        <span>{{ child.name }}</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<style global lang="scss">
.el-menu-item {
  margin: 0 12px 4px;
  border-radius: 4px;

  &:hover, &.is-active {
    background-color: #E6EFFC;
  }
}
</style>
