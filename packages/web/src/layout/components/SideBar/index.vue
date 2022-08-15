<script setup lang="ts">
import { CloudApp, Collaborate, DataBase, DeploymentPattern, DeploymentPolicy, StoragePool } from '@vicons/carbon'
import { useMenuStore } from '~/store'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()

const menus = ref<any>(menuStore.appMenus)

const switchRoute = (item: any) => {
  const path = item.path
  router.push(path)
}

const openMenu = menus.value.map((item) => {
  return item.name
})

const activeMenu = $computed(() => {
  const { meta, path } = route
  if (meta.activeMenu)
    return meta.activeMenu

  return path
})

const menuIcons: any = {
  dashboard: DeploymentPolicy,
  cloudfunction: CloudApp,
  database: DataBase,
  storage: StoragePool,
  replicate: DeploymentPattern,
  collaborate: Collaborate,
}
</script>

<template>
  <el-menu
    :default-active="activeMenu"
    :default-openeds="openMenu"
    text-color="#333" active-text-color="#09e" style="--el-menu-bg-color: #fff; --el-menu-border-color: #fff;"
  >
    <el-sub-menu v-for="item in menus" :key="item.name" :collapse="false" :index="item.name" style="margin: 6px 20px 6px;">
      <template #title>
        <el-icon :size="20">
          <component :is="menuIcons[item.name]" />
        </el-icon>

        <span>{{ t(`layout.menu.${item.name}`) }}</span>
      </template>
      <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path" @click="switchRoute(child)">
        <!-- <el-icon><location /></el-icon> -->
        <span class="pl-8px!">{{ child.name }}</span>
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
