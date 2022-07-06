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
  <el-aside width="200px">
    <el-scrollbar>
      <el-menu
        h-screen
      >
        <el-sub-menu v-for="item in menus" :key="item.name" :collapse="false" :index="item.name">
          <template #title>
            <el-icon><setting /></el-icon>
            <span>{{ item.name }}</span>
          </template>
          <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path" @click="switchRoute(child)">
            <!-- <el-icon><location /></el-icon> -->
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>
