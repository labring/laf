<script lang="ts" setup>
import ResetPassword from './ResetPassword.vue'
import { useUserStore } from '~/store'
const userStore = useUserStore()
const router = useRouter()

const logOut = async () => {
  await userStore.logOut()
  router.push('/login')
}
</script>

<template>
  <el-dropdown class="mr-12px">
    <span class="flex items-center cursor-pointer ml-6px">
      <span class="mr-4px ml-8px text-4 font-medium">{{ userStore.userProfile.username }}</span>
      <el-icon :size="16">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <common-opener v-slot="{ setRef, open }">
          <el-dropdown-item @click="open">
            {{ $t('layout.topbar.user.reset-password') }}
          </el-dropdown-item>
          <ResetPassword :ref="setRef" />
        </common-opener>
        <el-dropdown-item @click="logOut">
          {{ $t('layout.topbar.user.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
