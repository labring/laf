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
  <el-menu text-color="#333" active-text-color="#09e" style="--el-menu-bg-color: #fff; --el-menu-border-color: #fff;">
    <el-sub-menu v-for="item in menus" :key="item.name" :collapse="false" :index="item.name" style="margin: 6px 20px 6px;">
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
.el-menu-item, .el-sub-menu__title {
  margin: 0 0 4px;
  border-radius: 4px;

  &:hover,
  &.is-active {
    background-color: #E6EFFC;
  }
}
</style>
