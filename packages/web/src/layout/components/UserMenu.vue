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
  <el-dropdown>
    <span class="el-dropdown-link flex items-center cursor-pointer">
      {{ userStore.userProfile.username }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <common-opener v-slot="{ setRef, open }">
          <el-dropdown-item @click="open">
            {{ $t('layout.topbar.user.reset-password') }}
          </el-dropdown-item>
          <reset-password :ref="setRef" />
        </common-opener>
        <el-dropdown-item @click="logOut">
          {{ $t('layout.topbar.user.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
